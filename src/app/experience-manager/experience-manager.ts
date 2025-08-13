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
  // experiences: Experience[] = [
  //   {
  //     id: '1',
  //     company: 'Tech Innovations Inc.',
  //     position: 'Senior Full Stack Developer',
  //     startDate: '2022-01',
  //     endDate: '',
  //     current: true,
  //     description: 'Leading development of cutting-edge web applications using modern technologies. Responsible for architecting scalable solutions, mentoring junior developers, and driving technical excellence across multiple projects. Successfully delivered 15+ projects with 99.9% uptime.',
  //     skills: ['React', 'Node.js', 'AWS', 'TypeScript', 'PostgreSQL', 'Docker', 'Kubernetes']
  //   },
  //   {
  //     id: '2',
  //     company: 'Digital Solutions Ltd.',
  //     position: 'Frontend Developer',
  //     startDate: '2020-06',
  //     endDate: '2021-12',
  //     current: false,
  //     description: 'Developed responsive web applications and improved user experience across multiple platforms. Collaborated closely with design teams to implement pixel-perfect interfaces and optimized application performance by 40%.',
  //     skills: ['React', 'JavaScript', 'CSS', 'Figma', 'Git', 'Webpack', 'Jest']
  //   },
  //   {
  //     id: '3',
  //     company: 'StartupXYZ',
  //     position: 'Junior Web Developer',
  //     startDate: '2019-01',
  //     endDate: '2020-05',
  //     current: false,
  //     description: 'Built and maintained company websites and web applications. Gained experience in full-stack development and agile methodologies. Contributed to a 25% increase in user engagement through improved UI/UX implementations.',
  //     skills: ['HTML', 'CSS', 'JavaScript', 'PHP', 'MySQL', 'Bootstrap']
  //   }
  // ];

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
    console.log('experiences:', experiences);
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
    // Subscribe to modal trigger from overview
    this.modalSubscription = this.data.openExperienceModal$.subscribe(() => {
      console.log(
        'ExperienceManager: Received modal trigger, opening add experience modal'
      );
      this.addExperience();
    });
  }

  ngOnDestroy() {
    // Clean up subscription
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
      // If ongoing, clear the completion date
      this.experienceForm.patchValue({ completionDate: null });
    }
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

  editExperience(experience: IData['experiences'][number]) {
    this.editingExperience = experience;

    // Determine if the experience is ongoing
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

    // Basic client-side validation
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

    console.log(formValue.startDate);
    console.log(formValue.provider);

    // Handle completion date - if ongoing, set to null, otherwise use the selected date
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
            console.error('Failed to update experience:', error);
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
          console.error('Failed to add experience:', error);
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
        console.error('Delete failed', error);
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
