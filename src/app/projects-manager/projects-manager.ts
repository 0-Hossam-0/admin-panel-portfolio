import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  ExternalLink,
  FolderOpen,
  Github,
  LucideAngularModule,
  Plus,
  Star,
  Trash2,
  Upload,
  X,
  Image,
  Camera,
} from 'lucide-angular';
import { DataService, IData } from '../service/data.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

export interface ProjectImage {
  id: string;
  url: string;
  file?: File; // This will exist only for newly selected files
  name: string;
}

@Component({
  selector: 'app-projects-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './projects-manager.html',
  styleUrl: './projects-manager.css',
})
export class ProjectsManager implements OnInit, OnDestroy {
  projectForm: FormGroup;
  showModal = false;
  editingProject: IData['projects'][number] | null = null;
  currentImageIndex: { [projectId: string]: number } = {};
  selectedImages: ProjectImage[] = [];
  isDragOver = false;
  formErrors: { [key: string]: string } = {};
  isSubmitting = false;
  plusIcon = Plus;
  editIcon = Edit;
  trashIcon = Trash2;
  externalLinkIcon = ExternalLink;
  githubIcon = Github;
  folderOpenIcon = FolderOpen;
  starIcon = Star;
  imageIcon = Image;
  xIcon = X;
  chevronLeftIcon = ChevronLeft;
  chevronRightIcon = ChevronRight;
  uploadIcon = Upload;
  cameraIcon = Camera;
  private projectIdCounter = 1;
  private _projects?: IData['projects'];
  private modalSubscription?: Subscription;

  @Output() projectsUpdated = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private data: DataService,
    private router: Router
  ) {
    this.projectForm = this.fb.group({
      id: [1],
      title: [''],
      description: [''],
      githubLink: [''],
      technologies: [''],
    });

    this.projects?.forEach((project) => {
      this.currentImageIndex[project.id] = 0;
    });
  }

  ngOnInit() {
    // Subscribe to modal trigger from overview
    this.modalSubscription = this.data.openProjectModal$.subscribe(() => {
      console.log(
        'ProjectsManager: Received modal trigger, opening add project modal'
      );
      this.addProject();
    });
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
  }

  @Input({ required: true })
  set projects(projects: IData['projects'] | undefined) {
    this.projectIdCounter = 1;

    if (projects && projects.length > 0) {
      this._projects = projects.map((p) => ({
        ...p,
        id: (this.projectIdCounter++).toString(),
        images: p.images,
      }));
    } else {
      this._projects = [];
    }

    this.projectForm.patchValue({});
  }
  get projects() {
    return this._projects;
  }


  getCurrentImage(project: IData['projects'][number]): string {
    const index = this.currentImageIndex[project.id] || 0;
    const imagePath = project.images[index] || '';
    return imagePath;
  }

  nextImage(projectId: string) {
    const project = this.projects?.find((p) => p.id === projectId);
    if (project && project.images.length > 1) {
      const currentIndex = this.currentImageIndex[projectId] || 0;
      this.currentImageIndex[projectId] =
        (currentIndex + 1) % project.images.length;
    }
  }

  previousImage(projectId: string) {
    const project = this.projects?.find((p) => p.id === projectId);
    if (project && project.images.length > 1) {
      const currentIndex = this.currentImageIndex[projectId] || 0;
      this.currentImageIndex[projectId] =
        (currentIndex - 1 + project.images.length) % project.images.length;
    }
  }

  addProject() {
    this.editingProject = null;
    this.projectForm.reset();
    this.selectedImages = [];
    this.formErrors = {};
    this.showModal = true;
  }

  editProject(project: IData['projects'][number]) {
    this.editingProject = project;
    this.formErrors = {};
    console.log(project.images);

    // Convert string URLs to ProjectImage objects for editing
    this.selectedImages = project.images.map((imagePath, index) => ({
      id: `existing-${index}`,
      url: imagePath,
      name: `Image ${index + 1}`,
    }));

    this.projectForm.patchValue({
      title: project.title,
      description: project.description,
      githubLink: project.githubLink,
      technologies: project.technologies.join(', '),
    });

    this.currentImageIndex[project.id] = 0; // Initialize index
    this.showModal = true;
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    this.processFiles(files);
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
          const imageData: ProjectImage = {
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
    this.selectedImages.splice(index, 1);
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

  saveProject() {
    const formValue = this.projectForm.value;
    this.formErrors = {};
    this.isSubmitting = true;

    // Basic client-side validation
    if (!formValue.title?.trim()) {
      this.formErrors['title'] = 'Title is required';
    }
    if (!formValue.description?.trim()) {
      this.formErrors['description'] = 'Description is required';
    }

    if (Object.keys(this.formErrors).length > 0) {
      this.isSubmitting = false;
      return;
    }

    const projectData: Partial<IData['projects'][number]> = {
      title: formValue.title.trim(),
      description: formValue.description.trim(),
      githubLink: formValue.githubLink?.trim() || '',
      technologies: formValue.technologies
        ? formValue.technologies
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean)
        : [],
    };
    if (this.editingProject) {
      console.log(
        'values',
        this.editingProject.title,
        projectData,
        this.selectedImages
      );
      // Update existing project
      this.data
        .updateProject(
          this.editingProject.title,
          projectData,
          this.selectedImages
        ) // Pass selectedImages
        .subscribe({
          next: (updatedProject) => {
            console.log('Project updated successfully:', updatedProject);
            this.closeModal();
            this.projectsUpdated.emit();
          },
          error: (err) => {
            console.error('Failed to update project', err);
            this.handleBackendErrors(err);
            this.isSubmitting = false;
          },
        });
    } else {
      this.data.addProject(projectData, this.selectedImages).subscribe({
        next: () => {
          const currentUrl = this.router.url;
          this.router
            .navigateByUrl('/', { skipLocationChange: true })
            .then(() => {
              this.router.navigate([currentUrl]);
            });
          this.closeModal();
          this.projectsUpdated.emit();
        },
        error: (err) => {
          console.error('Failed to add project', err);
          this.handleBackendErrors(err);
          this.isSubmitting = false;
        },
      });
    }
  }

  deleteProject(project: { id: string; title: string }) {
    const isConfirmed = confirm(
      `Are you sure you want to delete "${project.title}"?`
    );
    if (!isConfirmed) return;

    this.data.deleteProject(project.title).subscribe({
      next: () => {
        this.projectsUpdated.emit();
        this.projects = this.projects?.filter((p) => {
          return project.title !== p.title;
        });
      },
      error: (error) => {
        console.error('Delete failed', error);
        alert('Failed to delete project. Please try again.');
      },
    });
  }

  closeModal() {
    this.showModal = false;
    this.editingProject = null;
    this.projectForm.reset();
    this.selectedImages = [];
    this.formErrors = {};
    this.isSubmitting = false;
  }

  getFieldError(fieldName: string): string {
    return this.formErrors[fieldName] || '';
  }

  hasFieldError(fieldName: string): boolean {
    return !!this.formErrors[fieldName];
  }
}
