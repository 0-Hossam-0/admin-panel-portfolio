import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, forkJoin, Observable, of, Subject } from 'rxjs';
import { ProjectImage } from '../projects-manager/projects-manager';

interface UpdateImage {
  id: string;
  url: string;
  file?: File;
  name: string;
}

export interface IData {
  projects: {
    id: string;
    title: string;
    technologies: string[];
    githubLink: string;
    description: string;
    images: string[];
  }[];
  contact: {
    email: string;
    phone: string;
    linkedin: string;
    github: string;
  };
  updates: {
    title: string;
    description: string;
    postDate: Date;
    images: string[];
  }[];
  experiences: {
    title: string;
    description: string;
    technologies: string[];
    completionDate: Date | null;
    startDate: Date;
    provider: string;
  }[];
  personal: {
    name: string;
    location: string;
    title: string;
    bio: string;
    skills: string[];
    image: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  // Modal trigger subjects
  private openProjectModalSubject = new Subject<void>();
  private openExperienceModalSubject = new Subject<void>();
  private openUpdateModalSubject = new Subject<void>();

  // Observable streams for modal triggers
  openProjectModal$ = this.openProjectModalSubject.asObservable();
  openExperienceModal$ = this.openExperienceModalSubject.asObservable();
  openUpdateModal$ = this.openUpdateModalSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Methods to trigger modals
  triggerProjectModal() {
    console.log('DataService: Triggering project modal');
    this.openProjectModalSubject.next();
  }

  triggerExperienceModal() {
    console.log('DataService: Triggering experience modal');
    this.openExperienceModalSubject.next();
  }

  triggerUpdateModal() {
    console.log('DataService: Triggering update modal');
    this.openUpdateModalSubject.next();
  }

  getAllData(): Observable<IData | null> {
    return forkJoin({
      projects: this.http.get<IData['projects']>(
        'http://localhost:3000/api/project'
      ),
      experiences: this.http.get<IData['experiences']>(
        'http://localhost:3000/api/experience'
      ),
      contact: this.http.get<IData['contact']>(
        'http://localhost:3000/api/contact'
      ),
      updates: this.http.get<IData['updates']>(
        'http://localhost:3000/api/update'
      ),
      personal: this.http.get<IData['personal']>(
        'http://localhost:3000/api/personal'
      ),
    }).pipe(
      catchError((error) => {
        console.log('Error Fetch', error);
        return of(null);
      })
    );
  }

  deleteProject(title: string): Observable<any> {
    return this.http.delete(`http://localhost:3000/api/project/${title}`, {
      withCredentials: true,
    });
  }

  addProject(
    project: Partial<IData['projects'][number]>,
    selectedImages: ProjectImage[]
  ): Observable<IData['projects'][number]> {
    const formData = new FormData();

    formData.append('title', project.title || '');
    formData.append('description', project.description || '');
    formData.append('githubLink', project.githubLink || '');
    if (project.technologies) {
      project.technologies.forEach((tech) => {
        formData.append('technologies', tech);
      });
    }

    const existingImageUrls: string[] = [];
    selectedImages.forEach((img) => {
      if (img.file) {
        formData.append('images', img.file, img.name);
      } else if (img.url && !img.url.startsWith('data:')) {
        existingImageUrls.push(img.url);
      }
    });

    return this.http.post<IData['projects'][number]>(
      `http://localhost:3000/api/project`,
      formData,
      {
        withCredentials: true,
      }
    );
  }

  updateProject(
    originalTitle: string,
    project: Partial<IData['projects'][number]>,
    selectedImages: ProjectImage[]
  ): Observable<IData['projects'][number]> {
    const formData = new FormData();

    formData.append('title', project.title || '');
    formData.append('description', project.description || '');
    formData.append('githubLink', project.githubLink || '');
    if (project.technologies) {
      project.technologies.forEach((tech) => {
        formData.append('technologies', tech);
      });
    }

    selectedImages.forEach((img) => {
      if (img.file) {
        formData.append('images', img.file, img.name);
      }
    });
    console.log('form data', formData);
    return this.http.put<IData['projects'][number]>(
      `http://localhost:3000/api/project/${originalTitle}`,
      formData,
      {
        withCredentials: true,
      }
    );
  }

  addExperience(
    experience: Partial<IData['experiences'][number]>
  ): Observable<IData['experiences'][number]> {
    return this.http.post<IData['experiences'][number]>(
      `http://localhost:3000/api/experience`,
      experience,
      {
        withCredentials: true,
      }
    );
  }

  deleteExperience(experienceId: string): Observable<any> {
    return this.http.delete(
      `http://localhost:3000/api/experience/${experienceId}`,
      {
        withCredentials: true,
      }
    );
  }

  updateExperience(
    experienceId: string,
    experience: Partial<IData['experiences'][number]>
  ): Observable<IData['experiences'][number]> {
    return this.http.put<IData['experiences'][number]>(
      `http://localhost:3000/api/experience/${experienceId}`,
      experience,
      {
        withCredentials: true,
      }
    );
  }

  saveContactInfo(contactInfo: IData['contact']): Observable<IData['contact']> {
    return this.http.put<IData['contact']>(
      `http://localhost:3000/api/contact/`,
      contactInfo,
      {
        withCredentials: true,
      }
    );
  }

  savePersonalInfo(personalInfo: FormData | IData['personal']) {
    return this.http.put(`http://localhost:3000/api/personal/`, personalInfo, {
      withCredentials: true,
    });
  }
  saveUpdate(
    updateData: Partial<IData['updates'][number]>,
    selectedImages: UpdateImage[]
  ): Observable<IData['updates'][number]> {
    const formData = new FormData();

    formData.append('title', updateData.title || '');
    formData.append('description', updateData.description || '');
    formData.append('postDate', updateData.postDate?.toISOString() || '');

    const existingImageUrls: string[] = [];
    selectedImages.forEach((img) => {
      if (img.file) {
        formData.append('images', img.file, img.name);
      } else if (img.url && !img.url.startsWith('data:')) {
        existingImageUrls.push(img.url);
      }
    });
    formData.append('existingImageUrls', JSON.stringify(existingImageUrls));

    return this.http.post<IData['updates'][number]>(
      `http://localhost:3000/api/update/`,
      formData,
      {
        withCredentials: true,
      }
    );
  }

  modifyUpdate(
    updateTitle: string,
    updateData: Partial<IData['updates'][number]>,
    selectedImages: UpdateImage[]
  ): Observable<IData['updates'][number]> {
    const formData = new FormData();

    formData.append('title', updateData.title || '');
    formData.append('description', updateData.description || '');
    formData.append('postDate', updateData.postDate?.toISOString() || '');

    const existingImageUrls: string[] = [];
    selectedImages.forEach((img) => {
      if (img.file) {
        formData.append('images', img.file, img.name);
      } else if (
        img.url &&
        !img.url.startsWith('data:') &&
        !img.url.includes('placeholder.svg')
      ) {
        const urlParts = img.url.split('/');
        const filename = urlParts[urlParts.length - 1];
        existingImageUrls.push(filename);
      }
    });

    return this.http.put<IData['updates'][number]>(
      `http://localhost:3000/api/update/${updateTitle}`,
      formData,
      {
        withCredentials: true,
      }
    );
  }

  deleteUpdate(updateTitle: string): Observable<any> {
    return this.http.delete(`http://localhost:3000/api/update/${updateTitle}`, {
      withCredentials: true,
    });
  }
}
