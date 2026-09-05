import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { UserProfile } from 'src/app/core/models/user.model';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-users-list',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usersList.html',
  styleUrl: './usersList.css',
})
export class UsersList {
  readonly userService = inject(UserService);

  users = signal<UserProfile[]>([]);
  totalUsers = signal<number>(0);
  limit = signal<number>(10);
  offset = signal<number>(0);

  selectedUser = signal<UserProfile | null>(null);
  selectedRoles = signal<string[]>([]);
  availableRoles: string[] = ['admin', 'user'];

  searchControl = new FormControl('');

  currentPage = () => Math.floor(this.offset() / this.limit()) + 1;
  totalPages = () => Math.ceil(this.totalUsers() / this.limit()) || 1;

  ngOnInit(): void {
    this.loadUsers();

    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.offset.set(0);
      this.loadUsers();
    });
  }

  loadUsers(): void {
    const search = this.searchControl.value || '';
    this.userService.getUsers(this.limit(), this.offset(), search).subscribe({
      next: (res: any) => {
     
        let usersArr: any[] = [];
        let total = 0;

        if (Array.isArray(res)) {
          usersArr = res;
          total = res.length;
        } else if (res?.users && Array.isArray(res.users)) {
          usersArr = res.users;
          total = typeof res.total === 'number' ? res.total : usersArr.length;
        } else if (res?.data && Array.isArray(res.data?.users)) {
          usersArr = res.data.users;
          total = typeof res.data.total === 'number' ? res.data.total : usersArr.length;
        } else if (res?.data && Array.isArray(res.data)) {
          usersArr = res.data;
          total = usersArr.length;
        } else {
          console.warn('getUsers: respuesta con formato inesperado', res);
        }

        this.users.set(usersArr);
        this.totalUsers.set(total);
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.users.set([]);
        this.totalUsers.set(0);
      }
    });
  }

  changePage(direction: number): void {
    const newOffset = this.offset() + (direction * this.limit());
    if (newOffset >= 0 && newOffset < this.totalUsers()) {
      this.offset.set(newOffset);
      this.loadUsers();
    }
  }

  openRoleModal(user: UserProfile): void {
    this.selectedUser.set(user);
    this.selectedRoles.set([...user.roles]);
  }

  closeRoleModal(): void {
    this.selectedUser.set(null);
    this.selectedRoles.set([]);
  }

  toggleRole(role: string): void {
    const current = this.selectedRoles();
    if (current.includes(role)) {
      this.selectedRoles.set(current.filter(r => r !== role));
    } else {
      this.selectedRoles.set([...current, role]);
    }
  }

  saveRoles(): void {
    const user = this.selectedUser();
    if (!user) return;

    this.userService.updateUserRoles(user.id, this.selectedRoles()).subscribe({
      next: (updatedUser) => {
        this.users.update(list =>
          list.map(u => u.id === updatedUser.id ? { ...u, roles: updatedUser.roles } : u)
        );
        this.closeRoleModal();
      }
    });
  }
}
