import {Box, Card, CardContent, Typography, CircularProgress, Button, IconButton, Stack, Dialog, DialogTitle, DialogContent, DialogActions, useTheme} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import EditIcon from "@mui/icons-material/Edit";
import AutoFixNormalIcon from '@mui/icons-material/AutoFixNormal';
import CloseIcon from "@mui/icons-material/Close";
import CancelIcon from "@mui/icons-material/Cancel";
import {blue, grey} from "@mui/material/colors";
import {useContext, useState, useRef, useEffect} from "react";
import {ToastContext} from "../hooks/ToastContext";
import {UploadFile, DeleteFile} from '../services/common.service';
import {apiUrl, constants} from "../utils/constants";
import { ReactPhotoEditor } from 'react-photo-editor';

interface ImageCaptureEditorProps {
    id: string;
    title: string;
    alt: string;
    callback: (filename: string) => void;
    preview: string;
    setPreview: (preview: string) => void;
}

function ImageCaptureEditor({
    id,
    title,
    alt,
    callback,
    preview,
    setPreview
}: ImageCaptureEditorProps) {
    const [loading, setLoading] = useState(false);
    const [filename, setFilename] = useState('');
    const [showWebcam, setShowWebcam] = useState(false);
    const [showEditor, setShowEditor] = useState(false);
    const [imageToEdit, setImageToEdit] = useState<File | string>('');
    const [webcamError, setWebcamError] = useState<string>('');
    const [isCapturing, setIsCapturing] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const toastContext: any = useContext(ToastContext);
    const theme = useTheme();

    // Cleanup webcam stream on unmount
    useEffect(() => {
        return () => {
            stopWebcam();
        };
    }, []);

    // Disable wheel zoom and touchpad zoom when editor is open
    useEffect(() => {
        if (showEditor) {
            const preventZoom = (e: Event) => {
                const wheelEvent = e as WheelEvent;
                // Prevent all zoom gestures: Ctrl+Wheel, Cmd+Wheel, or touchpad pinch
                if (wheelEvent.ctrlKey || wheelEvent.metaKey || (wheelEvent.deltaY && Math.abs(wheelEvent.deltaY) < Math.abs(wheelEvent.deltaX || 0))) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            };
            
            const preventZoomTouch = (e: Event) => {
                const touchEvent = e as TouchEvent;
                if (touchEvent.touches && touchEvent.touches.length > 1) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            };

            // Prevent zoom on the dialog content
            const dialogContent = document.querySelector('.MuiDialog-root .MuiDialogContent');
            if (dialogContent) {
                dialogContent.addEventListener('wheel', preventZoom as EventListener, { passive: false, capture: true });
                dialogContent.addEventListener('touchstart', preventZoomTouch as EventListener, { passive: false, capture: true });
                dialogContent.addEventListener('touchmove', preventZoomTouch as EventListener, { passive: false, capture: true });
            }
            
            // Prevent ALL wheel events on dialog to stop touchpad zoom
            const preventAllWheel = (e: Event) => {
                const wheelEvent = e as WheelEvent;
                // Check if event is within the dialog
                const target = e.target as HTMLElement;
                if (target && target.closest('.MuiDialog-root')) {
                    // Prevent Ctrl/Cmd + wheel (browser zoom)
                    if (wheelEvent.ctrlKey || wheelEvent.metaKey) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    // Prevent touchpad pinch zoom (detected by simultaneous deltaX and deltaY with ctrl)
                    // Some touchpads send wheel events for pinch gestures
                    if (wheelEvent.ctrlKey || (Math.abs(wheelEvent.deltaY || 0) > 0 && Math.abs(wheelEvent.deltaX || 0) > 0)) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }
            };
            
            // Prevent zoom on canvas directly - block ALL wheel events on canvas
            const preventCanvasZoom = (e: Event) => {
                e.preventDefault();
                e.stopPropagation();
                return false;
            };
            
            // Prevent drag/move on canvas
            const preventDrag = (e: Event) => {
                e.preventDefault();
                e.stopPropagation();
                return false;
            };

            const handleMouseDown = (e: Event) => {
                const mouseEvent = e as MouseEvent;
                // Prevent all mouse buttons that could be used for dragging/panning
                // Right-click (button 2) and middle-click (button 1) are often used for panning
                if (mouseEvent.button === 1 || mouseEvent.button === 2) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
                // For left-click, we'll prevent drag via mousemove handler
            };

            // const handleMouseMove = (e: Event) => {
            //     const mouseEvent = e as MouseEvent;
            //     // If mouse is moving with ANY button pressed, it's a drag - prevent it completely
            //     if (mouseEvent.buttons !== 0) {
            //         e.preventDefault();
            //         e.stopPropagation();
            //         e.stopImmediatePropagation();
            //         return false;
            //     }
            // };
            
            // More aggressive drag prevention - prevent all drag-related events
            const preventAllDrags = (e: Event) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
            };

            // Pointer move handler for drag prevention
            const handlePointerMove = (e: Event) => {
                const pointerEvent = e as PointerEvent;
                if (pointerEvent.buttons !== 0) {
                    preventAllDrags(e);
                }
            };

            // Set up canvas zoom and drag prevention after a short delay to ensure canvas is rendered
            const setupCanvasPrevention = () => {
                const canvas = document.querySelector('.MuiDialog-root canvas');
                if (canvas) {
                    canvas.addEventListener('wheel', preventCanvasZoom, { passive: false, capture: true });
                    canvas.addEventListener('touchstart', preventZoomTouch as EventListener, { passive: false, capture: true });
                    canvas.addEventListener('touchmove', preventDrag, { passive: false, capture: true });
                    // Prevent drag/move
                    canvas.addEventListener('mousedown', handleMouseDown, { passive: false, capture: true });
                    //canvas.addEventListener('mousemove', handleMouseMove, { passive: false, capture: true });
                    canvas.addEventListener('dragstart', preventAllDrags, { passive: false, capture: true });
                    canvas.addEventListener('drag', preventAllDrags, { passive: false, capture: true });
                    canvas.addEventListener('dragend', preventAllDrags, { passive: false, capture: true });
                    canvas.addEventListener('selectstart', preventAllDrags, { passive: false, capture: true });
                    // Prevent pointer events that could trigger drag
                    canvas.addEventListener('pointerdown', preventAllDrags, { passive: false, capture: true });
                    canvas.addEventListener('pointermove', handlePointerMove, { passive: false, capture: true });
                }
                // Also prevent drag on the container
                const editorContainer = document.querySelector('.MuiDialog-root .rpe-relative, .MuiDialog-root [class*="rpe"]');
                if (editorContainer) {
                    editorContainer.addEventListener('mousedown', handleMouseDown, { passive: false, capture: true });
                    //editorContainer.addEventListener('mousemove', handleMouseMove, { passive: false, capture: true });
                    editorContainer.addEventListener('dragstart', preventDrag, { passive: false, capture: true });
                    editorContainer.addEventListener('drag', preventDrag, { passive: false, capture: true });
                    editorContainer.addEventListener('selectstart', preventDrag, { passive: false, capture: true });
                    editorContainer.addEventListener('touchmove', preventDrag, { passive: false, capture: true });
                }
            };
            
            setTimeout(setupCanvasPrevention, 100);
            const intervalId = setInterval(setupCanvasPrevention, 500);
            
            // Prevent all wheel events on the entire dialog
            window.addEventListener('wheel', preventAllWheel, { passive: false, capture: true });
            window.addEventListener('touchstart', preventZoomTouch as EventListener, { passive: false, capture: true });
            window.addEventListener('touchmove', preventZoomTouch as EventListener, { passive: false, capture: true });
            
            return () => {
                clearInterval(intervalId);
                if (dialogContent) {
                    dialogContent.removeEventListener('wheel', preventZoom as EventListener);
                    dialogContent.removeEventListener('touchstart', preventZoomTouch as EventListener);
                    dialogContent.removeEventListener('touchmove', preventZoomTouch as EventListener);
                }
                const canvas = document.querySelector('.MuiDialog-root canvas');
                if (canvas) {
                    canvas.removeEventListener('wheel', preventCanvasZoom);
                    canvas.removeEventListener('touchstart', preventZoomTouch as EventListener);
                    canvas.removeEventListener('touchmove', preventZoomTouch as EventListener);
                    canvas.removeEventListener('mousedown', handleMouseDown);
                    //canvas.removeEventListener('mousemove', handleMouseMove);
                    canvas.removeEventListener('dragstart', preventAllDrags);
                    canvas.removeEventListener('drag', preventAllDrags);
                    canvas.removeEventListener('dragend', preventAllDrags);
                    canvas.removeEventListener('selectstart', preventAllDrags);
                    canvas.removeEventListener('pointerdown', preventAllDrags);
                    canvas.removeEventListener('pointermove', handlePointerMove);
                }
                const editorContainer = document.querySelector('.MuiDialog-root .rpe-relative, .MuiDialog-root [class*="rpe"]');
                if (editorContainer) {
                    editorContainer.removeEventListener('mousedown', handleMouseDown);
                    //editorContainer.removeEventListener('mousemove', handleMouseMove);
                    editorContainer.removeEventListener('dragstart', preventDrag);
                    editorContainer.removeEventListener('drag', preventDrag);
                    editorContainer.removeEventListener('selectstart', preventDrag);
                    editorContainer.removeEventListener('touchmove', preventDrag);
                }
                window.removeEventListener('wheel', preventAllWheel);
                window.removeEventListener('touchstart', preventZoomTouch as EventListener);
                window.removeEventListener('touchmove', preventZoomTouch as EventListener);
            };
        }
    }, [showEditor]);

    // Debug: Log when editor should show
    useEffect(() => {
        if (showEditor && imageToEdit && typeof imageToEdit !== 'string') {
            console.log('ReactPhotoEditor should render with file:', imageToEdit);
        }
    }, [showEditor, imageToEdit]);


    const validateFile = (file: File): string => {
        const fileSize = 1000 * 1000; // 1MB
        const extension = file.type.split("/").pop()?.toLowerCase();
        if (file.size > fileSize) {
            return 'File size must not exceed 1MB';
        } else if (!['jpeg', 'jpg', 'png'].includes(extension || '')) {
            return 'Only .png, .jpg allowed';
        }
        return '';
    };

    const uploadFile = async (file: File, previewUrl?: string) => {
        setLoading(true);
        try {
            const response = await UploadFile(constants.API_URL + apiUrl.uploadImage, file);
            if (response.status) {
                const finalPreview = previewUrl || URL.createObjectURL(file);
                setPreview(finalPreview);
                setFilename(response.file_uploaded);
                callback(response.file_uploaded);
            } else {
                toastContext.setToastSeverity('error');
                toastContext.setToastMessage(response.message || 'Upload failed');
                toastContext.setToast(true);
                clearFileInput();
            }
        } catch (error: any) {
            toastContext.setToastSeverity('error');
            toastContext.setToastMessage(error.message || 'Upload failed');
            toastContext.setToast(true);
            clearFileInput();
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const error = validateFile(file);
        if (error) {
            toastContext.setToastSeverity('error');
            toastContext.setToastMessage(error);
            toastContext.setToast(true);
            clearFileInput();
            return;
        }

        // Open editor with the uploaded file (pass File directly)
        setImageToEdit(file);
        setShowEditor(true);
    };

    const startWebcam = async () => {
        setWebcamError('');
        setIsCapturing(true);
        setShowWebcam(true); // Set immediately so video element renders
        
        try {
            // Request webcam permissions
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'user',
                    width: { ideal: 413 },
                    height: { ideal: 531 }
                } 
            });
            
            streamRef.current = stream;
            
            // Wait for next frame to ensure video element is rendered
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (videoRef.current && streamRef.current) {
                        videoRef.current.srcObject = streamRef.current;
                        
                        const handleLoadedMetadata = () => {
                            setIsCapturing(false);
                            videoRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
                        };
                        
                        const handleCanPlay = () => {
                            setIsCapturing(false);
                            videoRef.current?.removeEventListener('canplay', handleCanPlay);
                        };
                        
                        videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
                        videoRef.current.addEventListener('canplay', handleCanPlay);
                        
                        // Force play in case autoplay doesn't work
                        videoRef.current.play().catch(() => {
                            // Autoplay might be blocked, but stream is still set
                            setIsCapturing(false);
                        });
                    } else {
                        // If video element still not ready, try again after a short delay
                        setTimeout(() => {
                            if (videoRef.current && streamRef.current) {
                                videoRef.current.srcObject = streamRef.current;
                                videoRef.current.onloadedmetadata = () => setIsCapturing(false);
                                videoRef.current.oncanplay = () => setIsCapturing(false);
                                videoRef.current.play().catch(() => setIsCapturing(false));
                            }
                        }, 500);
                    }
                });
            });
        } catch (error: any) {
            setIsCapturing(false);
            setShowWebcam(false);
            let errorMessage = 'Unable to access webcam. ';
            
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                errorMessage += 'Please allow camera permissions and try again.';
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                errorMessage += 'No camera found on your device.';
            } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                errorMessage += 'Camera is being used by another application.';
            } else {
                errorMessage += error.message || 'An unknown error occurred.';
            }
            
            setWebcamError(errorMessage);
            toastContext.setToastSeverity('error');
            toastContext.setToastMessage(errorMessage);
            toastContext.setToast(true);
        }
    };

    const stopWebcam = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
            });
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
            videoRef.current.onloadedmetadata = null;
        }
        setShowWebcam(false);
        setIsCapturing(false);
        setWebcamError('');
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            
            if (!video.videoWidth || !video.videoHeight || video.readyState !== video.HAVE_ENOUGH_DATA) {
                toastContext.setToastSeverity('error');
                toastContext.setToastMessage('Camera not ready. Please wait a moment.');
                toastContext.setToast(true);
                return;
            }

            try {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                
                if (ctx) {
                    ctx.drawImage(video, 0, 0);
                    canvas.toBlob((blob) => {
                        if (blob) {
                            // Stop webcam first
                            stopWebcam();
                            
                            // Create preview URL from captured photo
                            const previewUrl = URL.createObjectURL(blob);
                            setPreview(previewUrl);
                            
                            // Convert blob to File and store for editing/uploading
                            const file = new File([blob], 'webcam-capture.jpg', { type: 'image/jpeg' });
                            setImageToEdit(file);
                            
                            // Upload the file
                            uploadFile(file, previewUrl);
                        } else {
                            toastContext.setToastSeverity('error');
                            toastContext.setToastMessage('Failed to capture photo');
                            toastContext.setToast(true);
                        }
                    }, 'image/jpeg', 0.9);
                } else {
                    toastContext.setToastSeverity('error');
                    toastContext.setToastMessage('Failed to initialize canvas');
                    toastContext.setToast(true);
                }
            } catch (error: any) {
                toastContext.setToastSeverity('error');
                toastContext.setToastMessage('Failed to capture photo: ' + (error.message || 'Unknown error'));
                toastContext.setToast(true);
            }
        } else {
            toastContext.setToastSeverity('error');
            toastContext.setToastMessage('Camera elements not available');
            toastContext.setToast(true);
        }
    };

    const handleEditorSave = (editedFile: File) => {
        setShowEditor(false);
        
        // Create preview URL from the edited file
        const previewUrl = URL.createObjectURL(editedFile);
        setPreview(previewUrl);
        uploadFile(editedFile, previewUrl);
    };

    const handleManualSave = () => {
        // Try to find and click the save button in ReactPhotoEditor
        setTimeout(() => {
            const editorContainer = document.querySelector('.rpe-relative, [class*="rpe"]');
            if (editorContainer) {
                const saveButtons = editorContainer.querySelectorAll('button');
                // Look for save/ok/apply buttons - ReactPhotoEditor might have these
                for (const btn of Array.from(saveButtons)) {
                    const text = btn.textContent?.toLowerCase() || '';
                    if (text.includes('save') || text.includes('ok') || text.includes('apply') || text.includes('done') || text.includes('confirm')) {
                        (btn as HTMLButtonElement).click();
                        return;
                    }
                }
                // Also check for buttons with specific classes or data attributes
                const possibleSaveBtn = editorContainer.querySelector('button[type="submit"], button.rpe-bg-black, button:last-child');
                if (possibleSaveBtn) {
                    (possibleSaveBtn as HTMLButtonElement).click();
                    return;
                }
            }
            // If no button found, show message
            toastContext.setToastSeverity('info');
            toastContext.setToastMessage('Please use the editor\'s built-in save button if available');
            toastContext.setToast(true);
        }, 100);
    };

    const handleEditorCancel = () => {
        setShowEditor(false);
        setImageToEdit('');
    };

    const clearFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removePicture = async () => {
        clearFileInput();
        setPreview('');
        callback('');
        if (filename) {
            try {
                await DeleteFile(constants.API_URL + apiUrl.deleteFile, filename);
            } catch (error) {
                console.error('Error deleting file:', error);
            }
        }
        setFilename('');
    };

    const handleEditClick = async () => {
        // If we already have the file stored (from capture or upload), use it directly
        if (imageToEdit && typeof imageToEdit !== 'string') {
            console.log('Editing existing file:', imageToEdit);
            setShowEditor(true);
            return;
        }
        
        if (preview) {
            try {
                // If preview is a URL, fetch it and convert to File
                if (preview.startsWith('http') || preview.startsWith('blob:') || preview.startsWith('data:')) {
                    const response = await fetch(preview);
                    const blob = await response.blob();
                    const file = new File([blob], 'image-to-edit.jpg', { type: blob.type || 'image/jpeg' });
                    console.log('Fetched file for editing:', file);
                    setImageToEdit(file);
                    setShowEditor(true);
                } else {
                    // If it's just a filename, we can't edit it without fetching from server
                    toastContext.setToastSeverity('error');
                    toastContext.setToastMessage('Cannot edit image. Please upload a new image.');
                    toastContext.setToast(true);
                    return;
                }
            } catch (error) {
                toastContext.setToastSeverity('error');
                toastContext.setToastMessage('Failed to load image for editing');
                toastContext.setToast(true);
            }
        }
    };

    return (
        <>
            <Card>
                <CardContent sx={{p: 3}}>
                    {preview ? (
                        <Box 
                            className={'upload-image-container'} 
                            sx={{
                                position: 'relative',
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}
                        >
                            <Box sx={{
                                position: 'absolute',
                                display: loading ? 'flex' : 'none',
                                zIndex: 3,
                                height: '100%',
                                width: '100%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(255,255,255,0.8)',
                                borderRadius: 1
                            }}>
                                <CircularProgress/>
                            </Box>
                            
                            <Box sx={{
                                position: 'relative',
                                width: '100%',
                                maxWidth: '100%',
                                borderRadius: 1,
                                overflow: 'hidden',
                                border: '1px solid',
                                borderColor: 'divider'
                            }}>
                                <img 
                                    src={preview} 
                                    alt={alt}
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        display: 'block'
                                    }}
                                />
                                
                                <IconButton
                                    onClick={removePicture}
                                    sx={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 1)',
                                        },
                                        zIndex: 2
                                    }}
                                    size="small"
                                >
                                    <CloseIcon color="error" />
                                </IconButton>
                            </Box>

                            {/* Only show edit button for user-uploaded images (file or webcam), not for server imageUrl */}
                            {(filename || (imageToEdit && typeof imageToEdit !== 'string')) && (
                                <Stack 
                                    direction="row" 
                                    spacing={1} 
                                    sx={{ 
                                        mt: 2, 
                                        width: '100%',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Button
                                        variant="outlined"
                                        startIcon={<AutoFixNormalIcon />}
                                        onClick={handleEditClick}
                                        disabled={loading}
                                        size="small"
                                    >
                                        Photo Editor
                                    </Button>
                                </Stack>
                            )}
                        </Box>
                    ) : showWebcam ? (
                        // Webcam Preview Section (Inline - replaces upload section)
                        <Box sx={{textAlign: 'center'}}>
                            {webcamError ? (
                                <Box sx={{textAlign: 'center', py: 4}}>
                                    <Typography color="error" sx={{mb: 2}}>
                                        {webcamError}
                                    </Typography>
                                    <Button variant="outlined" onClick={stopWebcam} startIcon={<CancelIcon />}>
                                        Cancel
                                    </Button>
                                </Box>
                            ) : (
                                <>
                                    <Box sx={{position: 'relative', width: '100%', borderRadius: 1, overflow: 'hidden', mb: 2}}>
                                        {isCapturing && (
                                            <Box sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                                zIndex: 2,
                                                borderRadius: '8px'
                                            }}>
                                                <CircularProgress sx={{color: 'white'}} />
                                                <Typography variant="body2" sx={{ml: 2, color: 'white'}}>
                                                    Starting camera...
                                                </Typography>
                                            </Box>
                                        )}
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            style={{
                                                width: '100%',
                                                height: 'auto',
                                                display: 'block',
                                                borderRadius: '8px',
                                                backgroundColor: '#000'
                                            }}
                                        />
                                        <canvas ref={canvasRef} style={{display: 'none'}} />
                                    </Box>
                                    <Stack direction="row" spacing={1} sx={{justifyContent: 'center'}}>
                                        <Button onClick={stopWebcam} size="small">Cancel</Button>
                                        <Button
                                            onClick={capturePhoto}
                                            variant="contained"
                                            color="primary"
                                            disabled={isCapturing}
                                            size="small"
                                        >
                                            {isCapturing ? 'Loading...' : 'Capture'}
                                        </Button>
                                    </Stack>
                                </>
                            )}
                        </Box>
                    ) : (
                        // Upload File Section
                        <Box sx={{textAlign: 'center'}}>
                            <label htmlFor={id}>
                                <Box 
                                    sx={{
                                        border: '2px dashed',
                                        borderColor: 'divider',
                                        borderRadius: 0,
                                        textAlign: 'center',
                                        p: 2,
                                        cursor: loading ? 'default' : 'pointer',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            borderColor: 'primary.main',
                                            backgroundColor: 'action.hover',
                                        }
                                    }}
                                >
                                    <AddPhotoAlternateIcon 
                                        sx={{
                                            fontSize: '60px', 
                                            color: blue[700],
                                            mb: 1
                                        }} 
                                    />
                                    <Typography variant="h6">{title}</Typography>
                                    <Typography variant="subtitle2" sx={{color: grey[400], mb: 2}}>(Only .png, .jpg allowed)</Typography>
                                    <input 
                                        type="file" 
                                        id={id} 
                                        ref={fileInputRef}
                                        style={{display: 'none'}} 
                                        onChange={handleFileUpload}
                                        accept="image/jpeg,image/jpg,image/png"
                                    />
                                    <Button
                                        
                                        startIcon={<CameraAltIcon />}
                                        onClick={startWebcam}
                                        disabled={loading || isCapturing}
                                        fullWidth
                                    >
                                    {isCapturing ? 'Starting Camera...' : 'Take Photo'}
                                </Button>
                                </Box>
                            </label>
                            
                            {/* <Box sx={{mt: 2}}>
                                <Button
                                    variant="outlined"
                                    startIcon={<CameraAltIcon />}
                                    onClick={startWebcam}
                                    disabled={loading || isCapturing}
                                    fullWidth
                                >
                                    {isCapturing ? 'Starting Camera...' : 'Take Photo'}
                                </Button>
                            </Box> */}
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Photo Editor Dialog */}
            <Dialog 
                open={showEditor && !!imageToEdit && typeof imageToEdit !== 'string'} 
                onClose={handleEditorCancel}
                maxWidth="sm" 
                fullWidth
            >
                <DialogTitle sx={{pb: 1}}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Typography variant="h6">Photo Editor</Typography>
                        <IconButton onClick={handleEditorCancel} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{p: 2, overflow: 'auto', position: 'relative', '& .rpe-fixed': { position: 'relative !important', inset: 'auto !important' }}}>
                    {imageToEdit && typeof imageToEdit !== 'string' && (
                        <Box sx={{
                            width: '100%', 
                            minHeight: '400px', 
                            position: 'relative',
                            '& .rpe-fixed': {
                                position: 'relative !important',
                                inset: 'auto !important',
                                zIndex: 'auto !important',
                                backgroundColor: 'transparent !important'
                            },
                            '& .rpe-absolute': {
                                position: 'relative !important'
                            },
                            // Hide ReactPhotoEditor's default buttons
                            '& .rpe-bottom-0 button': {
                                display: 'none !important'
                            },
                            '& .rpe-bottom-12 button': {
                                display: 'none !important'
                            },
                            '& [class*="rpe-bottom"] button': {
                                display: 'none !important'
                            }
                        }}>
                            <style>{`
                                .MuiDialog-root .rpe-fixed {
                                    position: relative !important;
                                    inset: auto !important;
                                    background-color: transparent !important;
                                }
                                .MuiDialog-root #photo-editor-modal { overflow: hidden !important; }

                                .MuiDialog-root .rpe-flex.rpe-flex-col > .rpe-items-center.rpe-flex:first-child {
                                    margin-top: 50px !important;
                                }

                                .MuiDialog-root #photo-editor-modal { 
                                    overflow: hidden !important;
                                    background-color: ${theme.palette.mode === 'dark' ? '#393939' : '#fff'} !important;
                                }

                                .MuiDialog-root #photo-editor-modal label{ 
                                    color: ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : '#000'} !important;
                                }

                                .MuiDialog-root [class*="rpe-fixed"] {
                                    position: relative !important;
                                }
                                /* Hide ReactPhotoEditor's default close and save buttons */
                                .MuiDialog-root .rpe-bottom-0 button,
                                .MuiDialog-root .rpe-bottom-12 button,
                                .MuiDialog-root [class*="rpe-bottom"] button {
                                    display: none !important;
                                }
                                /* Hide buttons in the bottom action section */
                                .MuiDialog-root .rpe-justify-end button,
                                .MuiDialog-root .rpe-justify-center button {
                                    display: none !important;
                                }
                                /* Hide any buttons that are direct children of bottom positioned containers */
                                .MuiDialog-root .rpe-bottom-0 > button,
                                .MuiDialog-root .rpe-bottom-12 > button {
                                    display: none !important;
                                }
                                /* Hide and disable zoom controls - target all possible zoom buttons */
                                .MuiDialog-root button[title*="zoom" i],
                                .MuiDialog-root button[title*="Zoom" i],
                                .MuiDialog-root [aria-label*="zoom" i],
                                .MuiDialog-root [aria-label*="Zoom" i],
                                .MuiDialog-root button:contains("zoom"),
                                .MuiDialog-root button:contains("Zoom") {
                                    display: none !important;
                                }
                                /* Hide and disable draw controls */
                                .MuiDialog-root button[title*="draw" i],
                                .MuiDialog-root button[title*="Draw" i],
                                .MuiDialog-root [aria-label*="draw" i],
                                .MuiDialog-root [aria-label*="Draw" i],
                                .MuiDialog-root button:contains("draw"),
                                .MuiDialog-root button:contains("Draw"),
                                .MuiDialog-root button[title*="pen" i],
                                .MuiDialog-root button[title*="Pen" i],
                                .MuiDialog-root [aria-label*="pen" i],
                                .MuiDialog-root [aria-label*="Pen" i] {
                                    display: none !important;
                                }
                                /* Hide and disable move controls */
                                .MuiDialog-root button[title*="move" i],
                                .MuiDialog-root button[title*="Move" i],
                                .MuiDialog-root [aria-label*="move" i],
                                .MuiDialog-root [aria-label*="Move" i],
                                .MuiDialog-root button:contains("move"),
                                .MuiDialog-root button:contains("Move"),
                                .MuiDialog-root button[title*="pan" i],
                                .MuiDialog-root button[title*="Pan" i],
                                .MuiDialog-root [aria-label*="pan" i],
                                .MuiDialog-root [aria-label*="Pan" i] {
                                    display: none !important;
                                }
                                /* Disable draw and move interactions */
                                .MuiDialog-root .rpe-cursor-crosshair,
                                .MuiDialog-root .rpe-cursor-move,
                                .MuiDialog-root .rpe-cursor-grab {
                                    cursor: default !important;
                                }
                                /* Prevent draw and move tool activation */
                                .MuiDialog-root [data-tool="draw"],
                                .MuiDialog-root [data-tool="move"],
                                .MuiDialog-root [data-tool="pen"],
                                .MuiDialog-root [data-tool="pan"] {
                                    display: none !important;
                                    pointer-events: none !important;
                                }
                                /* Disable zoom and drag interactions on canvas */
                                .MuiDialog-root canvas {
                                    touch-action: none !important;
                                    pointer-events: auto !important;
                                    user-select: none !important;
                                    -webkit-user-select: none !important;
                                    -moz-user-select: none !important;
                                    -ms-user-select: none !important;
                                    -webkit-user-drag: none !important;
                                    user-drag: none !important;
                                }
                                /* Disable drag on editor container */
                                .MuiDialog-root .rpe-relative,
                                .MuiDialog-root [class*="rpe-relative"],
                                .MuiDialog-root [class*="rpe-absolute"] {
                                    user-select: none !important;
                                    -webkit-user-select: none !important;
                                    -moz-user-select: none !important;
                                    -ms-user-select: none !important;
                                    -webkit-user-drag: none !important;
                                    user-drag: none !important;
                                    touch-action: none !important;
                                }
                                .MuiDialog-root .rpe-cursor-crosshair {
                                    cursor: default !important;
                                }
                                /* Disable wheel zoom on dialog content */
                                .MuiDialog-root .MuiDialogContent {
                                    overflow-x: hidden;
                                    touch-action: pan-x pan-y !important;
                                }
                                /* Prevent pinch zoom on touch devices */
                                .MuiDialog-root {
                                    touch-action: pan-x pan-y !important;
                                }
                                .MuiDialog-root * {
                                    touch-action: pan-x pan-y !important;
                                }
                                /* Prevent all zoom gestures */
                                .MuiDialog-root canvas,
                                .MuiDialog-root .rpe-relative,
                                .MuiDialog-root .rpe-absolute {
                                    -ms-touch-action: pan-x pan-y !important;
                                    touch-action: pan-x pan-y !important;
                                }
                            `}</style>
                            <ReactPhotoEditor
                                open={true}
                                file={imageToEdit}
                                onSaveImage={handleEditorSave}
                                onClose={() => {}} // Prevent ReactPhotoEditor from closing our dialog
                                modalWidth="100%"
                                modalHeight="auto"
                                allowZoom={false}
                                allowRotate={false}
                                allowDrawing={false}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{px: 3, pb: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider'}}>
                    <Button
                        variant="outlined"
                        onClick={handleEditorCancel}
                        size="medium"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleManualSave}
                        size="medium"
                        color="primary"
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

        </>
    );
}

export default ImageCaptureEditor;

