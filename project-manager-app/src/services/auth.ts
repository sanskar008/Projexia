import usersData from '@/data/users.json';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
}

export interface AuthUser extends User {
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData extends LoginCredentials {
  name: string;
}

class AuthService {
  private users: AuthUser[] = usersData.users;
  private currentUser: User | null = null;

  // Simulate localStorage for persistence
  private storageKey = 'projexia_current_user';

  constructor() {
    // Load user from localStorage on initialization
    const storedUser = localStorage.getItem(this.storageKey);
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
  }

  async login(credentials: LoginCredentials): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = this.users.find(
      u => u.email === credentials.email && u.password === credentials.password
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Remove password from user object before storing
    const { password, ...userWithoutPassword } = user;
    this.currentUser = userWithoutPassword;

    // Store in localStorage
    localStorage.setItem(this.storageKey, JSON.stringify(userWithoutPassword));

    return userWithoutPassword;
  }

  async signup(data: SignupData): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if user already exists
    if (this.users.some(u => u.email === data.email)) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const newUser: AuthUser = {
      id: String(this.users.length + 1),
      name: data.name,
      email: data.email,
      password: data.password,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
      role: 'user'
    };

    // Add to users array
    this.users.push(newUser);

    // Remove password from user object before storing
    const { password, ...userWithoutPassword } = newUser;
    this.currentUser = userWithoutPassword;

    // Store in localStorage
    localStorage.setItem(this.storageKey, JSON.stringify(userWithoutPassword));

    return userWithoutPassword;
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem(this.storageKey);
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
}

// Create a singleton instance
export const authService = new AuthService(); 