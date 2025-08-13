import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  Github,
  Linkedin,
  LucideAngularModule,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Save,
  Twitter,
} from 'lucide-angular';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { DataService, IData } from '../service/data.service';

@Component({
  selector: 'app-contact-info',
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  standalone: true,
  templateUrl: './contact-info.html',
  styleUrl: './contact-info.css',
})
export class ContactInfo {
  contactForm: FormGroup = new FormGroup({});
  saveIcon = Save;
  mailIcon = Mail;
  phoneIcon = Phone;
  mapPinIcon = MapPin;
  linkedinIcon = Linkedin;
  githubIcon = Github;
  twitterIcon = Twitter;
  messageCircleIcon = MessageCircle;
  private _contactInfo?: IData['contact'];

  @Input({ required: true })
  set contactInfo(value: IData['contact'] | undefined) {
    this._contactInfo = value;
    if (value) {
      this.contactForm.patchValue({
        email: value.email ?? '',
        phone: value.phone ?? '',
        linkedin: value.linkedin ?? '',
        github: value.github ?? '',
      });
    }
  }
  get contactInfo() {
    return this._contactInfo;
  }

  constructor(private fb: FormBuilder, private data: DataService) {
    this.contactForm = this.fb.group({
      email: [''],
      phone: [''],
      address: [''],
      linkedin: [''],
      github: [''],
      twitter: [''],
    });
  }

  onSave() {
    this.data.saveContactInfo(this.contactForm.value).subscribe({
      next: () => {
        this.contactInfo = this.contactForm.value;
        alert('Contact information saved successfully!');
      },
      error: (error) => {
        console.error('Delete failed', error);
        alert('Failed to save contact info. Please try again.');
      },
    });
  }
}
