import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, forkJoin, Observable, of, Subject } from 'rxjs';
import { ProjectImage } from '../projects-manager/projects-manager';
import { APP_URL } from '../environment/environment';

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
  private openProjectModalSubject = new Subject<void>();
  private openExperienceModalSubject = new Subject<void>();
  private openUpdateModalSubject = new Subject<void>();

  openProjectModal$ = this.openProjectModalSubject.asObservable();
  openExperienceModal$ = this.openExperienceModalSubject.asObservable();
  openUpdateModal$ = this.openUpdateModalSubject.asObservable();

  constructor(private http: HttpClient) {}

  triggerProjectModal() {
    this.openProjectModalSubject.next();
  }

  triggerExperienceModal() {
    this.openExperienceModalSubject.next();
  }

  triggerUpdateModal() {
    this.openUpdateModalSubject.next();
  }

  getAllData(): Observable<IData | null> {
    return forkJoin({
      projects: this.http.get<IData['projects']>(
        `${APP_URL}/project`
      ),
      experiences: this.http.get<IData[`experiences`]>(
        `${APP_URL}/experience`
      ),
      contact: this.http.get<IData[`contact`]>(
        `${APP_URL}/contact`
      ),
      updates: this.http.get<IData[`updates`]>(
        `${APP_URL}/update`
      ),
      personal: this.http.get<IData[`personal`]>(
        `${APP_URL}/personal`
      ),
    }).pipe(
      catchError((error) => {
        return of(null);
      })
    );
  }

  deleteProject(title: string): Observable<any> {
    return this.http.delete(`${APP_URL}/project/${title}`, {
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
      `${APP_URL}/project`,
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
    return this.http.put<IData['projects'][number]>(
      `${APP_URL}/project/${originalTitle}`,
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
      `${APP_URL}/experience`,
      experience,
      {
        withCredentials: true,
      }
    );
  }

  deleteExperience(experienceId: string): Observable<any> {
    return this.http.delete(
      `${APP_URL}/experience/${experienceId}`,
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
      `${APP_URL}/experience/${experienceId}`,
      experience,
      {
        withCredentials: true,
      }
    );
  }

  saveContactInfo(contactInfo: IData['contact']): Observable<IData['contact']> {
    return this.http.put<IData['contact']>(
      `${APP_URL}/contact/`,
      contactInfo,
      {
        withCredentials: true,
      }
    );
  }

  savePersonalInfo(personalInfo: FormData | IData['personal']) {
    return this.http.put(`${APP_URL}/personal/`, personalInfo, {
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
      `${APP_URL}/update/`,
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
      `${APP_URL}/update/${updateTitle}`,
      formData,
      {
        withCredentials: true,
      }
    );
  }

  deleteUpdate(updateTitle: string): Observable<any> {
    return this.http.delete(`${APP_URL}/update/${updateTitle}`, {
      withCredentials: true,
    });
  }
}
