import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  Award,
  Briefcase,
  Building,
  Calendar,
  Edit,
  LucideAngularModule,
  Plus,
  Trash2,
} from 'lucide-angular';
import { DataService, IData } from '../service/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-experience-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './experience-manager.html',
  styleUrl: './experience-manager.css',
})
export class ExperienceManager implements OnInit, OnDestroy {
  experienceForm: FormGroup;
  showModal = false;
  editingExperience: IData['experiences'][number] | null = null;
  private modalSubscription?: Subscription;
  formErrors: { [key: string]: string } = {};
  isSubmitting = false;

  plusIcon = Plus;
  editIcon = Edit;
  trashIcon = Trash2;
  buildingIcon = Building;
  calendarIcon = Calendar;
  briefcaseIcon = Briefcase;
  awardIcon = Award;
  private _experiences?: IData['experiences'];

  @Input({ required: true })
  set experiences(experiences: IData['experiences'] | undefined) {
    this._experiences = experiences;
    if (experiences) {
      this.experienceForm.patchValue([experiences]);
    }
  }
  get experiences() {
    return this._experiences;
  }

  constructor(private fb: FormBuilder, private data: DataService) {
    this.experienceForm = this.fb.group({
      provider: [''],
      title: [''],
      startDate: [new Date().toISOString().split('T')[0]],
      completionDate: [null],
      isOngoing: [false],
      description: [''],
      technologies: [''],
    });
  }

  ngOnInit() {
    this.modalSubscription = this.data.openExperienceModal$.subscribe(() => {
      this.addExperience();
    });
  }

  ngOnDestroy() {
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
  }

  addExperience() {
    this.editingExperience = null;
    this.formErrors = {};
    this.isSubmitting = false;
    this.experienceForm.reset({
      provider: '',
      title: '',
      startDate: new Date().toISOString().split('T')[0],
      completionDate: null,
      isOngoing: false,
      description: '',
      technologies: '',
    });
    this.showModal = true;
  }

  onOngoingChange(isOngoing: boolean) {
    if (isOngoing) {
      this.experienceForm.patchValue({ completionDate: null });
    }
  }

  private handleBackendErrors(error: any) {
    this.formErrors = {};

    if (error.error && error.error.errors) {
      const backendErrors = error.error.errors;
      Object.keys(backendErrors).forEach((field) => {
        this.formErrors[field] = backendErrors[field];
      });
    } else if (error.error && error.error.message) {
      this.formErrors['general'] = error.error.message;
    } else if (error.message) {
      this.formErrors['general'] = error.message;
    } else {
      this.formErrors['general'] =
        'An unexpected error occurred. Please try again.';
    }
  }

  editExperience(experience: IData['experiences'][number]) {
    this.editingExperience = experience;

    const isOngoing = experience.completionDate === null;

    this.experienceForm.patchValue({
      provider: experience.provider,
      title: experience.title,
      startDate: this.formatDateForInput(experience.startDate),
      completionDate: experience.completionDate
        ? this.formatDateForInput(experience.completionDate)
        : null,
      isOngoing: isOngoing,
      description: experience.description,
      technologies: experience.technologies.join(', '),
    });
    this.showModal = true;
  }

  saveExperience() {
    const formValue = this.experienceForm.value;
    this.formErrors = {};
    this.isSubmitting = true;

    if (!formValue.provider?.trim()) {
      this.formErrors['provider'] = 'Company name is required';
    }
    if (!formValue.title?.trim()) {
      this.formErrors['title'] = 'Position title is required';
    }
    if (!formValue.startDate) {
      this.formErrors['startDate'] = 'Start date is required';
    }
    if (!formValue.description?.trim()) {
      this.formErrors['description'] = 'Description is required';
    }
    if (!formValue.technologies?.trim()) {
      this.formErrors['technologies'] = 'At least one technology is required';
    }

    if (Object.keys(this.formErrors).length > 0) {
      this.isSubmitting = false;
      return;
    }

    let completionDate: Date | null = null;
    if (!formValue.isOngoing && formValue.completionDate) {
      completionDate = new Date(formValue.completionDate);
    }

    const experienceData: IData['experiences'][number] = {
      provider: formValue.provider,
      title: formValue.title,
      startDate: new Date(formValue.startDate),
      completionDate: completionDate,
      description: formValue.description,
      technologies: formValue.technologies
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean),
    };

    if (this.editingExperience) {
      this.data
        .updateExperience(this.editingExperience.title, experienceData)
        .subscribe({
          next: () => {
            const index = this.experiences?.findIndex(
              (e) => e.title === this.editingExperience!.title
            );
            if (this.experiences && index !== undefined && index > -1) {
              this.experiences[index] = experienceData;
            }
            this.closeModal();
          },
          error: (error) => {
            this.handleBackendErrors(error);
            this.isSubmitting = false;
          },
        });
    } else {
      this.data.addExperience(experienceData).subscribe({
        next: () => {
          this.experiences?.unshift(experienceData);
          this.closeModal();
        },
        error: (error) => {
          this.handleBackendErrors(error);
          this.isSubmitting = false;
        },
      });
    }
  }

  deleteExperience(title: string) {
    const isConfirmed = confirm(`Are you sure you want to delete "${title}"?`);
    if (!isConfirmed) return;

    this.data.deleteExperience(title).subscribe({
      next: () => {
        this.experiences = this.experiences?.filter((e) => {
          return e.title !== title;
        });
      },
      error: (error) => {
        this.formErrors['general'] =
          'Failed to delete experience. Please try again.';
      },
    });
  }

  closeModal() {
    this.showModal = false;
    this.editingExperience = null;
    this.formErrors = {};
    this.isSubmitting = false;
    this.experienceForm.reset({
      provider: '',
      title: '',
      startDate: new Date().toISOString().split('T')[0],
      completionDate: null,
      isOngoing: false,
      description: '',
      technologies: '',
    });
  }

  formatDate(date?: string | Date | null): string {
    if (!date) return 'Present';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Present';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  }

  formatDateForInput(date?: string | Date | null): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  }
}
