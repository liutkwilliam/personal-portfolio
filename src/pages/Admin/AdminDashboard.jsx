import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  buildPortfolioItemData,
  categoryOptions,
  deletePortfolioItem,
  fetchPortfolio,
  formatStoredDate,
  getExistingPhotos,
  getPhotoId,
  getStorageErrorMessage,
  loadStorageImages,
  savePortfolioItem,
  uploadPortfolioFile,
  uploadPortfolioImages,
} from '../../services/portfolioServices';
import { Inputs, Textarea, Dropdown } from '../../components/Inputs';
import AdminPhotoList from '../../components/AdminPhotoList';
import Button from '../../components/Button';
import { FaPen } from "react-icons/fa";
import { ImBin } from "react-icons/im";
import useSubtitle from '../../hooks/useSubtitle';

function AdminDashboard() {
  // entries for form fields
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [live, setLive] = useState(false);
  const [date, setDate] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  // image management
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const draggedPhotoIndex = useRef(null);
  const draftPhotosRef = useRef([]);
  const coverPhotoRef = useRef(null);
  const [draftPhotos, setDraftPhotos] = useState([]);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mediaLibrary, setMediaLibrary] = useState({
    images: [],
    loading: false,
    loaded: false,
    error: '',
  });

  useSubtitle({ title: 'Admin Dashboard', description: 'Manage portfolio entries and images.' });

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

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    const newPhotos = selectedFiles.map((file) => ({
      id: getPhotoId('new', file.name),
      file,
      previewUrl: URL.createObjectURL(file),
      description: '',
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
          description: '',
        },
      ];
    });
  };

  const handlePhotoDescriptionChange = (photoId, description) => {
    setDraftPhotos((currentPhotos) =>
      currentPhotos.map((photo) =>
        photo.id === photoId ? { ...photo, description } : photo
      )
    );
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

  const uploadFile = async (file, index = 0) => {
    return uploadPortfolioFile(file, index, setProgress);
  };

  const uploadImages = async () => {
    return uploadPortfolioImages(draftPhotos, setProgress);
  };

  const clearSelectedImages = () => {
    setDraftPhotos((currentPhotos) => {
      currentPhotos.forEach((photo) => {
        if (photo.file) URL.revokeObjectURL(photo.previewUrl);
      });
      return [];
    });
    setCoverPhoto((currentCoverPhoto) => {
      if (currentCoverPhoto) {
        URL.revokeObjectURL(currentCoverPhoto.previewUrl);
      }
      return null;
    });
    setCoverImageUrl('');
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }
  };

  const closeFirebaseImages = () => {
    setMediaLibrary({
      images: [],
      loading: false,
      loaded: false,
      error: '',
    });
  };

  // state management
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Track if we are editing an existing item
  const [editId, setEditId] = useState(null);

  // reset form
  const resetForm = () => {
    setEditId(null);
    setTitle('');
    setDescription('');
    setCategory('');
    setLive(false);
    setDate('');
    setSlug('');
    setContent('');
    setTags('');
    clearSelectedImages();
    closeFirebaseImages();
  };

  // fetch data
  const fetchItems = useCallback(async () => {
    setIsFetching(true);
    setErrorMessage('');

    try {
      setItems(await fetchPortfolio());
    } catch (error) {
      console.error('Error fetching documents: ', error);
      setErrorMessage('Could not fetch items from Firestore. Check the console and Firestore rules.');
    } finally {
      setIsFetching(false);
    }
  }, []);

  // run fetchItems on component mount
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // CREATE or UPDATE Data
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMessage('Title and Description are required.');
      return;
    }

    // Convert comma-separated string into an array of trimmed tags
    const tagsArray = tags.split(',').map((tag) => tag.trim()).filter(Boolean);
    setIsSaving(true);
    setUploading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const nextCoverImageUrl = coverPhoto
        ? await uploadFile(coverPhoto.file, 'cover')
        : coverImageUrl;
      const images = await uploadImages();
      const itemData = buildPortfolioItemData({
        title,
        description,
        category,
        live,
        date,
        slug,
        content,
        tags: tagsArray,
        coverImageUrl: nextCoverImageUrl,
        images,
      });

      if (editId) {
        await savePortfolioItem({ id: editId, itemData });
        setSuccessMessage('Item updated in Firestore.');
      } else {
        await savePortfolioItem({ itemData });
        setSuccessMessage('Item created in Firestore.');
      }

      resetForm();
      await fetchItems();
    } catch (error) {
      console.error('Error saving document: ', error);
      setErrorMessage(getStorageErrorMessage(error));
    } finally {
      setIsSaving(false);
      setUploading(false);
      setProgress(0);
    }
  };

  // Populate Form for Editing
  const handleEdit = (item) => {
    setEditId(item.id);
    setTitle(item.title || '');
    setDescription(item.description || '');
    setCategory(item.category || '');
    setLive(item.live || false);
    setDate(item.date || '');
    setSlug(item.slug || '');
    setContent(item.content || '');
    setTags(item.tags ? item.tags.join(', ') : '');
    setDraftPhotos((currentPhotos) => {
      currentPhotos.forEach((photo) => {
        if (photo.file) URL.revokeObjectURL(photo.previewUrl);
      });
      return getExistingPhotos(item.images || [], item.imageUrls || []);
    });
    setCoverPhoto((currentCoverPhoto) => {
      if (currentCoverPhoto) {
        URL.revokeObjectURL(currentCoverPhoto.previewUrl);
      }
      return null;
    });
    setCoverImageUrl(item.coverImageUrl || '');
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }
    setSuccessMessage('');
    setErrorMessage('');
  };

  // DELETE Data
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        setErrorMessage('');
        setSuccessMessage('');
        await deletePortfolioItem(id);
        setSuccessMessage('Item deleted from Firestore.');
        await fetchItems();
      } catch (error) {
        console.error('Error deleting document: ', error);
        setErrorMessage('Could not delete item from Firestore. Check the console and Firestore rules.');
      }
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        {/* see all projects */}
        <div className='h-[90vh] overflow-auto'>
          <div className="mt-6 flex items-center justify-between gap-3">
            <h3 className="text-xl font-semibold text-slate-900">Stored Items</h3>
            <Button type="button" onClick={fetchItems} disabled={isFetching} variant="secondary">
              {isFetching ? 'Fetching...' : 'Fetch Data'}
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-4 p-2">
            <div>Title / Slug</div>
            <div>Date</div>
            <div>Category</div>
            <div>Last Update</div>
          </div>
          {isFetching && items.length === 0 ? <p className="mt-3 text-slate-600">Loading items from Firestore...</p> : null}
          {
            !isFetching && items.length === 0 ? <p className="mt-3 text-slate-600">No items found.</p> : (
              items.map((item) => (
                <div key={item.id} className="my-4 rounded border border-slate-200 bg-slate-50 p-4 shadow-md">
                  <div className="grid grid-cols-4 gap-2">
                    <p className="col-span-3 font-semibold text-slate-900">{item.title}</p>
                    <div className="col-span-1 place-self-end flex gap-2">
                      <div className='px-2 py-1 border rounded select-none'>{item.live == false ? "Draft" : "Live"}</div>
                      <Button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="bg-amber-400 text-slate-900 transition hover:bg-amber-500 text-sm"
                      >
                        <FaPen />
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-600 text-white transition hover:bg-red-700"
                      >
                        <ImBin />
                      </Button>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">Slug: {item.slug}</p>
                    <p className="mt-1 text-sm text-slate-500">{formatStoredDate(item.date)}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.category}</p>
                    <div className="mt-1 text-sm text-slate-500">{formatStoredDate(item.updatedAt)}</div>

                    <div className="col-span-4 flex flex-wrap gap-2">
                      {item.tags && item.tags.map((tag, index) => (
                        <span key={index} className="rounded bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* <div className="mt-1 text-sm text-slate-500">Created At: {item.createdAt?.toDate?.()?.toLocaleString() || 'N/A'}</div> */}



                </div>
              ))
            )
          }
        </div>
        {/*edit portfolio entries */}
        <div className='h-[90vh] overflow-auto'>
          <p className="text-2xl font-bold text-slate-900">Portfolio Entry Editing Form</p>
          <p className="mt-2 text-sm text-slate-600">
            Create, edit portfolio entries in the <span className="font-semibold">items</span> collection and fetches them back from Firestore.
          </p>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="mb-8 mt-6 flex flex-col gap-2">
            <Inputs
              label="Title"
              type="text"
              placeholder="A title that describes the item"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Inputs
              label="Description"
              type="text"
              placeholder="a short description of the item, in less than 20 words"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Dropdown label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select Category</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Dropdown>
            <Dropdown label="Live Status" value={live} onChange={(e) => setLive(e.target.value === 'true')}>
              <option value="false">Draft</option>
              <option value="true">Live</option>
            </Dropdown>
            <Inputs
              label="Date and Time"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Inputs
              label="Slug"
              type="text"
              placeholder="Slug (e.g., my-item-slug)"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            <Textarea
              label="Content (Markdown supported)"
              placeholder="Enter the content includes markdown formatting and allow HTML tags"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Inputs
              label="Tags"
              type="text"
              placeholder="Tags (comma separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            {/* cover photo box */}
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
                  {mediaLibrary.loading ? 'Loading Firebase Images...' : 'Select From Existing Firebase Images'}
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

            {/* multiple photos */}
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
                  {mediaLibrary.loading ? 'Loading Firebase Images...' : 'Select From Existing Firebase Images'}
                </Button>
              </div>
              {mediaLibrary.loaded && (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
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
                onDescriptionChange={handlePhotoDescriptionChange}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
                disabled={uploading}
              />

              {uploading && <p>Uploading ({progress}%)</p>}
            </div>


            {errorMessage && (
              <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
            )}
            {successMessage && (
              <p className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{successMessage}</p>
            )}
            <Button
              type="submit"
              disabled={isSaving}
              className={`text-white transition ${editId ? 'bg-primary hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
                }`}
            >
              {isSaving ? 'Saving...' : editId ? 'Update Item' : 'Add Item'}
            </Button>
            {editId && (
              <Button
                type="button"
                onClick={resetForm}
                className="bg-slate-500 transition hover:bg-slate-300"
              >
                Cancel Edit
              </Button>
            )}
          </form>
        </div>
      </div >
    </>
  );
}

export default AdminDashboard;
