import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  Bell,
  Calendar,
  Camera,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  EyeOff,
  LucideAngularModule,
  Plus,
  Tag,
  Trash2,
  Upload,
  X,
  Zap,
  Image,
} from 'lucide-angular';
import { DataService, IData } from '../service/data.service';
import { Subscription } from 'rxjs';

interface UpdateImage {
  id: string;
  url: string;
  file?: File;
  name: string;
}

@Component({
  selector: 'app-updates-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './updates-manager.html',
  styleUrl: './updates-manager.css',
})
export class UpdatesManager implements OnInit, OnDestroy {
  updateForm: FormGroup;
  showModal = false;
  editingUpdate: IData['updates'][number] | null = null;
  selectedImages: UpdateImage[] = [];
  isDragOver = false;
  currentUpdateImageIndex: { [updateId: string]: number } = {};
  isSubmitting = false;
  private modalSubscription?: Subscription;
  formErrors: { [key: string]: string } = {};

  plusIcon = Plus;
  editIcon = Edit;
  trashIcon = Trash2;
  calendarIcon = Calendar;
  tagIcon = Tag;
  bellIcon = Bell;
  eyeIcon = Eye;
  eyeOffIcon = EyeOff;
  zapIcon = Zap;
  imageIcon = Image;
  xIcon = X;
  chevronLeftIcon = ChevronLeft;
  chevronRightIcon = ChevronRight;
  uploadIcon = Upload;
  cameraIcon = Camera;

  private _updates: IData['updates'] = [];

  @Input({ required: true })
  set updates(value: IData['updates'] | undefined) {
    console.log('Updates received:', value);
    this._updates = value || [];
    if (this._updates.length > 0) {
      this._updates.forEach((update, index) => {
        const updateId = `update-${index}`;
        if (this.currentUpdateImageIndex[updateId] === undefined) {
          this.currentUpdateImageIndex[updateId] = 0;
        }
      });
    }
  }

  get updates(): IData['updates'] {
    return this._updates;
  }

  @Output() updatesUpdated = new EventEmitter<void>();

  constructor(private fb: FormBuilder, private dataService: DataService) {
    this.updateForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      postDate: [new Date().toISOString().split('T')[0], Validators.required],
      category: ['news'],
    });
  }

  ngOnInit() {
    // Subscribe to modal trigger from overview
    this.modalSubscription = this.dataService.openUpdateModal$.subscribe(() => {
      console.log(
        'UpdatesManager: Received modal trigger, opening add update modal'
      );
      this.addUpdate();
    });
  }

  // Helper method to handle backend errors
  private handleBackendErrors(error: any) {
    this.formErrors = {};

    if (error.error && error.error.errors) {
      // Handle validation errors from backend
      const backendErrors = error.error.errors;
      Object.keys(backendErrors).forEach((field) => {
        this.formErrors[field] = backendErrors[field];
      });
    } else if (error.error && error.error.message) {
      // Handle general error message
      this.formErrors['general'] = error.error.message;
    } else if (error.message) {
      // Handle other error types
      this.formErrors['general'] = error.message;
    } else {
      // Fallback error message
      this.formErrors['general'] =
        'An unexpected error occurred. Please try again.';
    }
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
  }

  getCurrentUpdateImage(
    update: IData['updates'][number],
    index: number
  ): string {
    const updateId = `update-${index}`;
    const imageIndex = this.currentUpdateImageIndex[updateId] || 0;
    const imagePath = update.images[imageIndex] || '';
    return imagePath;
  }

  nextUpdateImage(index: number) {
    if (!this.updates || index >= this.updates.length) return;

    const updateId = `update-${index}`;
    const update = this.updates[index];
    if (update && update.images && update.images.length > 1) {
      this.currentUpdateImageIndex[updateId] =
        (this.currentUpdateImageIndex[updateId] + 1) % update.images.length;
    }
  }

  previousUpdateImage(index: number) {
    if (!this.updates || index >= this.updates.length) return;

    const updateId = `update-${index}`;
    const update = this.updates[index];
    if (update && update.images && update.images.length > 1) {
      const currentIndex = this.currentUpdateImageIndex[updateId] || 0;
      this.currentUpdateImageIndex[updateId] =
        currentIndex === 0 ? update.images.length - 1 : currentIndex - 1;
    }
  }

  setCurrentUpdateImage(index: number, imageIndex: number) {
    if (!this.updates || index >= this.updates.length) return;

    const updateId = `update-${index}`;
    const update = this.updates[index];
    if (
      update &&
      update.images &&
      imageIndex >= 0 &&
      imageIndex < update.images.length
    ) {
      this.currentUpdateImageIndex[updateId] = imageIndex;
    }
  }

  addUpdate() {
    this.editingUpdate = null;
    this.selectedImages = [];
    this.formErrors = {};
    this.isSubmitting = false;
    this.updateForm.reset({
      title: '',
      description: '',
      postDate: new Date().toISOString().split('T')[0],
      category: 'news',
    });
    this.showModal = true;
  }

  editUpdate(update: IData['updates'][number]) {
    this.editingUpdate = update;

    this.selectedImages = (update.images || []).map((imagePath, index) => ({
      id: `existing-${index}`,
      url: imagePath,
      name: `Image ${index + 1}`,
    }));

    this.updateForm.patchValue({
      title: update.title,
      description: update.description,
      postDate: new Date(update.postDate).toISOString().split('T')[0],
      category: 'news',
    });
    this.showModal = true;
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      this.processFiles(files);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files) {
      this.processFiles(files);
    }
  }

  processFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData: UpdateImage = {
            id: Date.now().toString() + i,
            url: e.target?.result as string,
            file: file,
            name: file.name,
          };
          this.selectedImages.push(imageData);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(index: number) {
    if (index >= 0 && index < this.selectedImages.length) {
      this.selectedImages.splice(index, 1);
    }
  }

  saveUpdate() {
    this.formErrors = {};

    if (this.updateForm.invalid) {
      this.updateForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.updateForm.value;

    const updateData = {
      title: formValue.title,
      description: formValue.description,
      postDate: new Date(formValue.postDate),
    };

    if (this.editingUpdate) {
      this.dataService
        .modifyUpdate(this.editingUpdate.title, updateData, this.selectedImages)
        .subscribe({
          next: () => {
            console.log('Update modified successfully');
            this.closeModal();
            this.updatesUpdated.emit();
          },
          error: (error) => {
            console.error('Failed to modify update:', error);
            this.handleBackendErrors(error);
            this.isSubmitting = false;
          },
        });
    } else {
      this.dataService.saveUpdate(updateData, this.selectedImages).subscribe({
        next: (savedData: any) => {
          this._updates = savedData;
          if (savedData && savedData.image) {
            this.selectedImages = []; // Clear selected images after successful save
          }
          this.isSubmitting = false;
          this.closeModal();
          this.updatesUpdated.emit();
        },
        error: (error) => {
          console.error('Failed to save update:', error);
          this.handleBackendErrors(error);
          this.isSubmitting = false;
        },
      });
    }
  }

  deleteUpdate(update: IData['updates'][number]) {
    if (!update || !update.title) return;

    if (confirm(`Are you sure you want to delete "${update.title}"?`)) {
      this.dataService.deleteUpdate(update.title).subscribe({
        next: () => {
          console.log('Update deleted successfully');
          this.updatesUpdated.emit();
        },
        error: (error) => {
          console.error('Failed to delete update:', error);
          this.formErrors['general'] =
            'Failed to delete update. Please try again.';
        },
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingUpdate = null;
    this.selectedImages = [];
    this.isSubmitting = false;
    this.formErrors = {};
  }

  getCategoryClass(category: string): string {
    switch (category) {
      case 'project':
        return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
      case 'achievement':
        return 'bg-gradient-to-r from-green-400 to-emerald-600 text-white';
      case 'news':
        return 'bg-gradient-to-r from-purple-400 to-purple-600 text-white';
      case 'blog':
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
    }
  }

  formatDate(dateString: string | Date): string {
    if (!dateString) return 'Unknown Date';
    const date =
      typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
