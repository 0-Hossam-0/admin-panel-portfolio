import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  Camera,
  LucideAngularModule,
  Save,
  Upload,
  User,
} from 'lucide-angular';
import { DataService, IData } from '../service/data.service';

@Component({
  selector: 'app-personal-info',
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  standalone: true,
  templateUrl: './personal-info.html',
  styleUrl: './personal-info.css',
})
export class PersonalInfo {
  personalForm: FormGroup;
  uploadIcon = Upload;
  saveIcon = Save;
  userIcon = User;
  cameraIcon = Camera;

  isLoading = false;
  private _personalInfo?: IData['personal'];
  imagePreview: string | null = null;
  imagePreviewTemp: string | ArrayBuffer | null = null;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  @Input({ required: true })
  set personalInfo(value: IData['personal'] | undefined) {
    this._personalInfo = value;
    if (value) {
      this.personalForm.patchValue({
        skills: value.skills ? value.skills.join(', ') : '',
        title: value.title ?? '',
        bio: value.bio ?? '',
        name: value.name ?? '',
        location: value.location ?? '',
        image: value.image ?? '',
      });

      this.imagePreview = value.image || null;
      this.imagePreviewTemp = value.image || null;
      console.log('image preview1', this.imagePreview);
    }
  }

  get personalInfo() {
    return this._personalInfo;
  }

  constructor(private fb: FormBuilder, private data: DataService) {
    this.personalForm = this.fb.group({
      skills: [],
      title: [''],
      bio: [''],
      name: [''],
      location: [''],
      image: [''],
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        this.imagePreviewTemp = reader.result;
        this.imagePreview = null;

        this.personalForm.patchValue({
          image: file,
        });
      };
      reader.readAsDataURL(file);
    }
  }

  onSave() {
    if (this.personalForm.invalid) {
      alert('Please fill all required fields');
      return;
    }

    this.isLoading = true;

    const formData = new FormData();
    const formValue = this.personalForm.value;

    Object.keys(formValue).forEach((key) => {
      if (
        key !== 'image' &&
        formValue[key] !== null &&
        formValue[key] !== undefined
      ) {
        if (key === 'skills') {
          const skillsArray = formValue[key]
            .split(',')
            .map((s: string) => s.trim());
          skillsArray.forEach((skill: string) => {
            formData.append('skills', skill);
          });
        } else {
          formData.append(key, formValue[key]);
        }
      }
    });

    if (formValue.image instanceof File) {
      formData.append('image', formValue.image, formValue.image.name);
    } else if (formValue.image && typeof formValue.image === 'string') {
      formData.append('image', formValue.image);
    }

    console.log('FormData entries:');
    for (const pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    this.data.savePersonalInfo(formData).subscribe({
      next: (savedData: any) => {
        this._personalInfo = savedData;
        if (savedData && savedData.image) {
          this.imagePreviewTemp = savedData.image;
        }
        this.isLoading = false;
        alert('Personal information saved successfully!');
      },
      error: (error) => {
        console.error('Save failed', error);
        this.isLoading = false;
        alert(`Failed to save: ${error.message}`);
      },
    });
  }
}
