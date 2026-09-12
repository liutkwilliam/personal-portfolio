import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirebaseDebugInfo, storage, waitForAuthenticatedUser } from '../config/firebase';
import { ref, uploadBytesResumable, getDownloadURL, listAll } from 'firebase/storage';
import { addPortfolioItem, updatePortfolioItem } from '../services/portfolioServices';
import AdminPhotoList from './AdminPhotoList';
import Button from './Button';

const categoryOptions = [
    { label: 'Design', value: 'Design', path: '/portfolio' },
    { label: 'Developer', value: 'Developer', path: '/developer' },
    { label: 'Photography', value: 'Photography', path: '/photography' },
];

const storageImageFolder = 'portfolio/images';

const initialFormData = {
    title: '',
    shortDescription: '',
    category: '',
    date: '',
    portfolioUrl: '',
    content: '',
    tags: '',
};

const getCategoryPath = (category) =>
    categoryOptions.find((option) => option.value === category)?.path || '';

const createSlug = (value = '') =>
    value
        .trim()
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const getDateValue = (value) => {
    if (!value) return null;
    const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const toDateTimeInputValue = (value) => {
    const date = getDateValue(value);
    if (!date) return '';

    const pad = (number) => String(number).padStart(2, '0');
    return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate()),
    ].join('-') + `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const getInitialFormData = (project) => ({
    title: project?.title || '',
    shortDescription: project?.shortDescription || '',
    category: project?.category || '',
    date: toDateTimeInputValue(project?.date),
    portfolioUrl: project?.portfolioUrl || '',
    content: project?.content || '',
    tags: Array.isArray(project?.tags) ? project.tags.join(', ') : project?.tags || '',
});

const getExistingPhotos = (imageUrls = []) =>
    imageUrls.map((url, index) => ({
        id: `existing-${index}-${url}`,
        previewUrl: url,
        url,
        alt: `Existing photo ${index + 1}`,
    }));

const getStorageImageName = (path = '') => decodeURIComponent(path.split('/').pop() || path);

const loadStorageImages = async () => {
    await waitForAuthenticatedUser();

    const folderRef = ref(storage, storageImageFolder);
    let result;

    try {
        result = await listAll(folderRef);
    } catch (error) {
        error.storagePath = folderRef.fullPath;
        throw error;
    }

    return Promise.all(
        result.items.map(async (itemRef) => ({
            id: itemRef.fullPath,
            name: getStorageImageName(itemRef.name),
            path: itemRef.fullPath,
            url: await getDownloadURL(itemRef),
        }))
    );
};

const getStorageErrorMessage = (error) => {
    const debugInfo = getFirebaseDebugInfo();
    const details = [
        error?.code && `code: ${error.code}`,
        error?.storagePath && `path: ${error.storagePath}`,
        debugInfo.storageBucket && `bucket: ${debugInfo.storageBucket}`,
        debugInfo.currentUser?.email && `user: ${debugInfo.currentUser.email}`,
        error?.serverResponse && `server: ${error.serverResponse}`,
    ]
        .filter(Boolean)
        .join(' | ');

    if (error?.code === 'storage/unauthorized') {
        return `Firebase Storage denied access. ${details}`;
    }

    if (error?.message) return details ? `${error.message} ${details}` : error.message;

    return details ? `Firebase Storage could not be accessed. ${details}` : 'Firebase Storage could not be accessed. Please try again.';
};

export default function ProjectForm({ projectId, initialProject = null, mode = 'add' }) {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const coverInputRef = useRef(null);
    const draggedPhotoIndex = useRef(null);
    const draftPhotosRef = useRef([]);
    const coverPhotoRef = useRef(null);
    const [formData, setFormData] = useState(() => getInitialFormData(initialProject));
    const [draftPhotos, setDraftPhotos] = useState(() => getExistingPhotos(initialProject?.imageUrls));
    const [coverPhoto, setCoverPhoto] = useState(null);
    const [coverImageUrl, setCoverImageUrl] = useState(initialProject?.coverImageUrl || '');
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [mediaLibrary, setMediaLibrary] = useState({
        images: [],
        loading: false,
        loaded: false,
        error: '',
    });
    const categoryPath = getCategoryPath(formData.category);

    useEffect(() => {
        draftPhotosRef.current = draftPhotos;
    }, [draftPhotos]);

    useEffect(() => {
        coverPhotoRef.current = coverPhoto;
    }, [coverPhoto]);

    useEffect(() => {
        return () => {
            draftPhotosRef.current.forEach((photo) => {
                if (photo.file) URL.revokeObjectURL(photo.previewUrl);
            });
            if (coverPhotoRef.current) {
                URL.revokeObjectURL(coverPhotoRef.current.previewUrl);
            }
        };
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((currentData) => ({
            ...currentData,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length === 0) return;

        const newPhotos = selectedFiles.map((file) => ({
            id: `${crypto.randomUUID()}-${file.name}`,
            file,
            previewUrl: URL.createObjectURL(file),
        }));

        setDraftPhotos((currentPhotos) => [...currentPhotos, ...newPhotos]);
        e.target.value = '';
    };

    const handleCoverFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setCoverPhoto((currentCoverPhoto) => {
            if (currentCoverPhoto) {
                URL.revokeObjectURL(currentCoverPhoto.previewUrl);
            }

            return {
                file: selectedFile,
                previewUrl: URL.createObjectURL(selectedFile),
            };
        });
        e.target.value = '';
    };

    const loadMediaLibrary = async () => {
        if (mediaLibrary.loading || mediaLibrary.loaded) return;

        setMediaLibrary((currentLibrary) => ({
            ...currentLibrary,
            loading: true,
            error: '',
        }));

        try {
            const images = await loadStorageImages();

            setMediaLibrary({
                images,
                loading: false,
                loaded: true,
                error: '',
            });
        } catch (error) {
            console.error('Error loading Firebase Storage images:', error);
            setMediaLibrary((currentLibrary) => ({
                ...currentLibrary,
                loading: false,
                loaded: true,
                error: getStorageErrorMessage(error),
            }));
        }
    };

    const addExistingPhoto = (image) => {
        setDraftPhotos((currentPhotos) => {
            if (currentPhotos.some((photo) => photo.url === image.url)) {
                return currentPhotos;
            }

            return [
                ...currentPhotos,
                {
                    id: `storage-${image.path}`,
                    previewUrl: image.url,
                    url: image.url,
                    alt: image.name,
                },
            ];
        });
    };

    const selectExistingCover = (image) => {
        setCoverPhoto((currentCoverPhoto) => {
            if (currentCoverPhoto) {
                URL.revokeObjectURL(currentCoverPhoto.previewUrl);
            }
            return null;
        });
        setCoverImageUrl(image.url);
        if (coverInputRef.current) {
            coverInputRef.current.value = '';
        }
    };

    const movePhoto = (fromIndex, toIndex) => {
        setDraftPhotos((currentPhotos) => {
            if (toIndex < 0 || toIndex >= currentPhotos.length || fromIndex === toIndex) {
                return currentPhotos;
            }

            const reorderedPhotos = [...currentPhotos];
            const [movedPhoto] = reorderedPhotos.splice(fromIndex, 1);
            reorderedPhotos.splice(toIndex, 0, movedPhoto);
            return reorderedPhotos;
        });
    };

    const handlePhotoDelete = (photoId) => {
        setDraftPhotos((currentPhotos) => {
            const photoToDelete = currentPhotos.find((photo) => photo.id === photoId);
            if (photoToDelete?.file) {
                URL.revokeObjectURL(photoToDelete.previewUrl);
            }

            return currentPhotos.filter((photo) => photo.id !== photoId);
        });
    };

    const handleCoverDelete = () => {
        setCoverPhoto((currentCoverPhoto) => {
            if (currentCoverPhoto) {
                URL.revokeObjectURL(currentCoverPhoto.previewUrl);
            }
            return null;
        });
        setCoverImageUrl('');
        if (coverInputRef.current) {
            coverInputRef.current.value = '';
        }
    };

    const handleDragStart = (index) => {
        draggedPhotoIndex.current = index;
    };

    const handleDrop = (dropIndex) => {
        if (draggedPhotoIndex.current === null) return;

        movePhoto(draggedPhotoIndex.current, dropIndex);
        draggedPhotoIndex.current = null;
    };

    const resetForm = () => {
        setFormData(mode === 'edit' ? getInitialFormData(initialProject) : initialFormData);
        setDraftPhotos((currentPhotos) => {
            currentPhotos.forEach((photo) => {
                if (photo.file) URL.revokeObjectURL(photo.previewUrl);
            });
            return mode === 'edit' ? getExistingPhotos(initialProject?.imageUrls) : [];
        });
        setCoverPhoto((currentCoverPhoto) => {
            if (currentCoverPhoto) {
                URL.revokeObjectURL(currentCoverPhoto.previewUrl);
            }
            return null;
        });
        setCoverImageUrl(mode === 'edit' ? initialProject?.coverImageUrl || '' : '');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (coverInputRef.current) {
            coverInputRef.current.value = '';
        }
        setError('');
        setProgress(0);
    };

    const handleCancel = () => {
        resetForm();
        navigate('/admin');
    };

    const uploadFile = async (file, index = 0) => {
        await waitForAuthenticatedUser();

        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
        const storageRef = ref(storage, `${storageImageFolder}/${Date.now()}_${index}_${safeName}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    setProgress(prog);
                },
                (error) => {
                    error.storagePath = storageRef.fullPath;
                    console.error('Upload error:', error);
                    reject(error);
                },
                async () => {
                    const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadUrl);
                }
            );
        });
    };

    const uploadImages = async () => {
        const uploadPromises = draftPhotos.map((photo, index) => {
            if (photo.url) return Promise.resolve(photo.url);
            return uploadFile(photo.file, index);
        });

        return Promise.all(uploadPromises);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.title.trim()) {
            setError('Please enter a title.');
            return;
        }
        if (!formData.category) {
            setError('Please select a category.');
            return;
        }
        const displayDate = formData.date ? new Date(formData.date) : null;
        if (formData.date && Number.isNaN(displayDate.getTime())) {
            setError('Please enter a valid date and time.');
            return;
        }

        setUploading(true);

        try {
            const slug = createSlug(formData.title);
            const nextCoverImageUrl = coverPhoto
                ? await uploadFile(coverPhoto.file)
                : coverImageUrl;
            const imageUrls = await uploadImages();
            const projectData = {
                title: formData.title.trim(),
                slug,
                shortDescription: formData.shortDescription.trim(),
                category: formData.category.trim(),
                categoryPath,
                date: displayDate,
                portfolioUrl: formData.portfolioUrl.trim(),
                content: formData.content.trim(),
                tags: formData.tags
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                coverImageUrl: nextCoverImageUrl,
                imageUrls,
                updatedAt: new Date(),
            };

            if (mode === 'edit' && projectId) {
                await updatePortfolioItem(projectId, {
                    ...projectData,
                    entryUrl: `${categoryPath}/${slug}`,
                });
            } else {
                const newProjectId = await addPortfolioItem({
                    ...projectData,
                    createdAt: new Date(),
                });

                await updatePortfolioItem(newProjectId, {
                    entryUrl: `${categoryPath}/${slug}`,
                });
            }

            alert(mode === 'edit' ? 'Project updated successfully!' : 'Project added successfully!');
            resetForm();
            navigate('/admin');
        } catch (error) {
            console.error('Error saving to Firestore:', error);
            setError(getStorageErrorMessage(error) || 'Project could not be saved. Please try again.');
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input name="title" value={formData.title} onChange={handleInputChange} type="text" placeholder="Title" className="mb-2 w-full rounded border px-3 py-2" />
            <input name="shortDescription" value={formData.shortDescription} onChange={handleInputChange} type="text" placeholder="Short Description" className="mb-2 w-full rounded border px-3 py-2" />
            <select name="category" value={formData.category} onChange={handleInputChange} className="mb-2 w-full rounded border px-3 py-2">
                <option value="">Select Category</option>
                {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
            {categoryPath && (
                <p className="mb-2 rounded bg-blue-50 px-3 py-2 text-sm text-primary">
                    This project will appear under {categoryPath}.
                </p>
            )}
            <input name="date" value={formData.date} onChange={handleInputChange} type="datetime-local" placeholder="Display Date" className="mb-2 w-full rounded border px-3 py-2" />
            <input name="portfolioUrl" value={formData.portfolioUrl} onChange={handleInputChange} type="text" placeholder="Portfolio Url" className="mb-2 w-full rounded border px-3 py-2" />
            <textarea name="content" value={formData.content} onChange={handleInputChange} placeholder="Content" className="mb-2 w-full rounded border px-3 py-2" rows="4"></textarea>
            <input name="tags" value={formData.tags} onChange={handleInputChange} type="text" placeholder="Tags (comma-separated)" className="mb-2 w-full rounded border px-3 py-2" />
            <div className="mb-4">
                <p className='text-xl font-medium'>Upload Cover Image</p>
                <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverFileChange}
                    disabled={uploading}
                    className="mt-2 rounded px-3 py-2 cursor-pointer bg-slate-100 shadow-lg disabled:cursor-not-allowed disabled:bg-gray-200"
                />
                <div className="mt-3">
                    <Button type="button" onClick={loadMediaLibrary} disabled={uploading || mediaLibrary.loading} variant="secondary" size="sm">
                        {mediaLibrary.loading ? 'Loading Firebase Images...' : 'Choose Existing Firebase Image'}
                    </Button>
                </div>
                {mediaLibrary.error && (
                    <p className="mt-2 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{mediaLibrary.error}</p>
                )}
                {mediaLibrary.loaded && (
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                        {mediaLibrary.images.map((image) => {
                            const isSelected = coverImageUrl === image.url;

                            return (
                                <button
                                    key={`cover-${image.path}`}
                                    type="button"
                                    onClick={() => selectExistingCover(image)}
                                    disabled={uploading || isSelected}
                                    className="rounded border border-slate-200 bg-white p-2 text-left shadow-sm transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <img src={image.url} alt={image.name} className="mb-2 aspect-square w-full rounded object-cover" />
                                    <span className="block truncate text-xs text-slate-700">{isSelected ? 'Selected' : image.name}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
                {(coverPhoto?.previewUrl || coverImageUrl) && (
                    <div className="mt-4 max-w-sm rounded border border-slate-200 bg-white p-3 shadow-sm">
                        <img
                            src={coverPhoto?.previewUrl || coverImageUrl}
                            alt="Cover preview"
                            className="mb-3 aspect-video w-full rounded object-cover"
                        />
                        <Button type="button" onClick={handleCoverDelete} disabled={uploading} variant="danger" size="sm">
                            Remove Cover
                        </Button>
                    </div>
                )}
            </div>
            <div className="mb-4">
                <p className='text-xl font-medium'>Upload Multiple Images</p>

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="mt-2 rounded px-3 py-2 cursor-pointer bg-slate-100 shadow-lg disabled:cursor-not-allowed disabled:bg-gray-200"
                />
                <div className="mt-3">
                    <Button type="button" onClick={loadMediaLibrary} disabled={uploading || mediaLibrary.loading} variant="secondary" size="sm">
                        {mediaLibrary.loading ? 'Loading Firebase Images...' : 'Add Existing Firebase Images'}
                    </Button>
                </div>
                {mediaLibrary.loaded && (
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                        {mediaLibrary.images.map((image) => {
                            const isSelected = draftPhotos.some((photo) => photo.url === image.url);

                            return (
                                <button
                                    key={`image-${image.path}`}
                                    type="button"
                                    onClick={() => addExistingPhoto(image)}
                                    disabled={uploading || isSelected}
                                    className="rounded border border-slate-200 bg-white p-2 text-left shadow-sm transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <img src={image.url} alt={image.name} className="mb-2 aspect-square w-full rounded object-cover" />
                                    <span className="block truncate text-xs text-slate-700">{isSelected ? 'Selected' : image.name}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                <AdminPhotoList
                    photos={draftPhotos}
                    onDelete={handlePhotoDelete}
                    onMove={movePhoto}
                    onDragStart={handleDragStart}
                    onDrop={handleDrop}
                    disabled={uploading}
                />

                {uploading && <p>Uploading ({progress}%)</p>}
            </div>
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={uploading}>
                {uploading ? 'Saving Project...' : mode === 'edit' ? 'Update Project' : 'Save Project'}
            </Button>
            <Button type="button" onClick={resetForm} disabled={uploading} variant="neutral" className="ml-2">
                Clear
            </Button>
            <Button type="button" onClick={handleCancel} disabled={uploading} variant="danger" className="ml-2">
                Cancel
            </Button>
        </form>
    )
}
