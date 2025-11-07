// Enhanced Merchant Authentication and Authorization Service for MobBitWallet
// This service handles merchant-specific authentication, roles, permissions, and security

export interface MerchantUser {
  id: string;
  email: string;
  name: string;
  isMerchant: boolean;
  merchantProfile?: MerchantProfile;
  roles: UserRole[];
  permissions: Permission[];
  mfaEnabled: boolean;
  lastLoginAt?: string;
  loginAttempts: number;
  accountLocked: boolean;
  lockedUntil?: string;
  securityQuestions: SecurityQuestion[];
  devices: AuthDevice[];
  apiKeys: ApiKey[];
  createdAt: string;
  updatedAt: string;
}

export interface MerchantProfile {
  id: string;
  userId: string;
  businessName: string;
  businessType: BusinessType;
  registrationNumber?: string;
  taxId?: string;
  website?: string;
  phone?: string;
  address: BusinessAddress;
  businessCategory: BusinessCategory;
  monthlyVolume: MonthlyVolumeRange;
  supportedCurrencies: string[];
  description?: string;
  verificationStatus: VerificationStatus;
  complianceLevel: ComplianceLevel;
  kycCompleted: boolean;
  kycCompletedAt?: string;
  riskLevel: RiskLevel;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface SecurityQuestion {
  id: string;
  question: string;
  answer: string; // Stored encrypted
  isActive: boolean;
  createdAt: string;
}

export interface AuthDevice {
  id: string;
  deviceId: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  deviceName: string;
  userAgent: string;
  ipAddress: string;
  lastUsedAt: string;
  isTrusted: boolean;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string; // Encrypted in storage
  secret: string; // Encrypted in storage
  permissions: Permission[];
  lastUsedAt?: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean;
  createdAt: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'execute';
  description: string;
  category: PermissionCategory;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  status: 'success' | 'failed';
}

export interface Session {
  id: string;
  userId: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  lastActivityAt: string;
}

export type BusinessType = 
  | 'sole_proprietorship' 
  | 'partnership' 
  | 'llc' 
  | 'corporation' 
  | 'non_profit' 
  | 'government';

export type BusinessCategory = 
  | 'retail' 
  | 'services' 
  | 'technology' 
  | 'healthcare' 
  | 'finance' 
  | 'education' 
  | 'hospitality' 
  | 'manufacturing' 
  | 'other';

export type MonthlyVolumeRange = 
  | 'under_10k' 
  | '10k_50k' 
  | '50k_100k' 
  | '100k_500k' 
  | '500k_1m' 
  | '1m_5m' 
  | 'over_5m';

export type VerificationStatus = 
  | 'not_started' 
  | 'pending' 
  | 'under_review' 
  | 'approved' 
  | 'rejected' 
  | 'suspended';

export type ComplianceLevel = 
  | 'basic' 
  | 'standard' 
  | 'enhanced' 
  | 'enterprise';

export type RiskLevel = 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'critical';

export type UserRole = 
  | 'owner' 
  | 'admin' 
  | 'manager' 
  | 'accountant' 
  | 'support' 
  | 'viewer';

export type PermissionCategory = 
  | 'payments' 
  | 'transactions' 
  | 'customers' 
  | 'reports' 
  | 'settings' 
  | 'users' 
  | 'api' 
  | 'security';

export interface MerchantAuthConfig {
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  sessionTimeout: number; // minutes
  mfaRequired: boolean;
  apiRateLimit: number; // requests per minute
  allowedIpRanges: string[];
  deviceApprovalRequired: boolean;
  passwordPolicy: PasswordPolicy;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventReusedPasswords: number;
  expirationDays: number;
}

class MerchantAuthService {
  private users: Map<string, MerchantUser> = new Map();
  private merchantProfiles: Map<string, MerchantProfile> = new Map();
  private roles: Map<string, Role> = new Map();
  private auditLogs: AuditLog[] = [];
  private sessions: Map<string, Session> = new Map();
  private config: MerchantAuthConfig;

  constructor() {
    this.config = {
      maxLoginAttempts: 5,
      lockoutDuration: 30,
      sessionTimeout: 120,
      mfaRequired: false,
      apiRateLimit: 100,
      allowedIpRanges: [],
      deviceApprovalRequired: true,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        preventReusedPasswords: 5,
        expirationDays: 90
      }
    };

    this.initializeRoles();
    this.initializeDefaultUsers();
  }

  /**
   * Initialize default roles and permissions
   */
  private initializeRoles(): void {
    const permissions: Permission[] = [
      // Payments permissions
      { id: 'payment_create', name: 'Create Payments', resource: 'payments', action: 'create', description: 'Create new payment requests', category: 'payments' },
      { id: 'payment_read', name: 'View Payments', resource: 'payments', action: 'read', description: 'View payment requests and history', category: 'payments' },
      { id: 'payment_update', name: 'Update Payments', resource: 'payments', action: 'update', description: 'Modify existing payment requests', category: 'payments' },
      { id: 'payment_delete', name: 'Delete Payments', resource: 'payments', action: 'delete', description: 'Cancel payment requests', category: 'payments' },
      
      // Transactions permissions
      { id: 'transaction_read', name: 'View Transactions', resource: 'transactions', action: 'read', description: 'View transaction history', category: 'transactions' },
      { id: 'transaction_refund', name: 'Process Refunds', resource: 'transactions', action: 'execute', description: 'Process transaction refunds', category: 'transactions' },
      
      // Customers permissions
      { id: 'customer_create', name: 'Create Customers', resource: 'customers', action: 'create', description: 'Add new customers', category: 'customers' },
      { id: 'customer_read', name: 'View Customers', resource: 'customers', action: 'read', description: 'View customer information', category: 'customers' },
      { id: 'customer_update', name: 'Update Customers', resource: 'customers', action: 'update', description: 'Modify customer information', category: 'customers' },
      
      // Reports permissions
      { id: 'report_read', name: 'View Reports', resource: 'reports', action: 'read', description: 'View financial reports', category: 'reports' },
      { id: 'report_export', name: 'Export Reports', resource: 'reports', action: 'execute', description: 'Export report data', category: 'reports' },
      
      // Settings permissions
      { id: 'settings_read', name: 'View Settings', resource: 'settings', action: 'read', description: 'View merchant settings', category: 'settings' },
      { id: 'settings_update', name: 'Update Settings', resource: 'settings', action: 'update', description: 'Modify merchant settings', category: 'settings' },
      
      // Users permissions
      { id: 'user_create', name: 'Create Users', resource: 'users', action: 'create', description: 'Create new user accounts', category: 'users' },
      { id: 'user_read', name: 'View Users', resource: 'users', action: 'read', description: 'View user accounts', category: 'users' },
      { id: 'user_update', name: 'Update Users', resource: 'users', action: 'update', description: 'Modify user accounts', category: 'users' },
      { id: 'user_delete', name: 'Delete Users', resource: 'users', action: 'delete', description: 'Delete user accounts', category: 'users' },
      
      // API permissions
      { id: 'api_create', name: 'Create API Keys', resource: 'api', action: 'create', description: 'Generate API keys', category: 'api' },
      { id: 'api_read', name: 'View API Keys', resource: 'api', action: 'read', description: 'View API keys and usage', category: 'api' },
      { id: 'api_delete', name: 'Delete API Keys', resource: 'api', action: 'delete', description: 'Revoke API keys', category: 'api' },
      
      // Security permissions
      { id: 'security_read', name: 'View Security Settings', resource: 'security', action: 'read', description: 'View security configuration', category: 'security' },
      { id: 'security_update', name: 'Update Security Settings', resource: 'security', action: 'update', description: 'Modify security configuration', category: 'security' }
    ];

    const roles: Role[] = [
      {
        id: 'owner',
        name: 'Owner',
        description: 'Full access to all merchant features',
        permissions: permissions.map(p => p.id),
        isSystemRole: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'admin',
        name: 'Administrator',
        description: 'Administrative access to most features',
        permissions: permissions.filter(p => !['user_delete', 'security_update'].includes(p.id)).map(p => p.id),
        isSystemRole: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'manager',
        name: 'Manager',
        description: 'Manage day-to-day operations',
        permissions: permissions.filter(p => 
          ['payments', 'transactions', 'customers', 'reports'].includes(p.category)
        ).map(p => p.id),
        isSystemRole: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'accountant',
        name: 'Accountant',
        description: 'Financial reporting and transaction management',
        permissions: permissions.filter(p => 
          ['transactions', 'reports'].includes(p.category) || 
          p.id === 'payment_read'
        ).map(p => p.id),
        isSystemRole: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'support',
        name: 'Support',
        description: 'Customer support and basic operations',
        permissions: permissions.filter(p => 
          ['payment_read', 'transaction_read', 'customer_read', 'report_read'].includes(p.id)
        ).map(p => p.id),
        isSystemRole: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'viewer',
        name: 'Viewer',
        description: 'Read-only access',
        permissions: permissions.filter(p => p.action === 'read').map(p => p.id),
        isSystemRole: true,
        createdAt: new Date().toISOString()
      }
    ];

    roles.forEach(role => {
      this.roles.set(role.id, role);
    });
  }

  /**
   * Initialize default merchant users
   */
  private initializeDefaultUsers(): void {
    const defaultUsers: MerchantUser[] = [
      {
        id: 'merchant_1',
        email: 'merchant@mobbitwallet.com',
        name: 'Merchant User',
        isMerchant: true,
        roles: ['owner'],
        permissions: this.getRolePermissions(['owner']),
        mfaEnabled: false,
        loginAttempts: 0,
        accountLocked: false,
        securityQuestions: [],
        devices: [],
        apiKeys: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    defaultUsers.forEach(user => {
      this.users.set(user.id, user);
    });

    // Create corresponding merchant profile
    const merchantProfile: MerchantProfile = {
      id: 'profile_1',
      userId: 'merchant_1',
      businessName: 'MobBitWallet Demo Business',
      businessType: 'llc',
      registrationNumber: '123456789',
      taxId: '98-7654321',
      website: 'https://mobbitwallet.com',
      phone: '+1-555-0123',
      address: {
        street: '123 Blockchain Ave',
        city: 'Crypto Valley',
        state: 'CA',
        postalCode: '94000',
        country: 'US'
      },
      businessCategory: 'technology',
      monthlyVolume: '50k_100k',
      supportedCurrencies: ['USD', 'EUR', 'BTC'],
      description: 'Demonstration business for MobBitWallet merchant features',
      verificationStatus: 'approved',
      complianceLevel: 'standard',
      kycCompleted: true,
      kycCompletedAt: new Date().toISOString(),
      riskLevel: 'low',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.merchantProfiles.set(merchantProfile.id, merchantProfile);
  }

  /**
   * Authenticate merchant user
   */
  async authenticateMerchant(email: string, password: string, deviceInfo?: {
    deviceId: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
    deviceName: string;
    userAgent: string;
    ipAddress: string;
  }): Promise<{ success: boolean; user?: MerchantUser; session?: Session; error?: string }> {
    const user = Array.from(this.users.values()).find(u => u.email === email);
    
    if (!user) {
      this.logAuditEvent('login_failed', 'auth', null, { email, reason: 'user_not_found' }, deviceInfo?.ipAddress || '', deviceInfo?.userAgent || '');
      return { success: false, error: 'Invalid credentials' };
    }

    if (user.accountLocked) {
      if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
        return { success: false, error: 'Account temporarily locked. Please try again later.' };
      } else {
        // Unlock account if lockout period has expired
        user.accountLocked = false;
        user.loginAttempts = 0;
        user.lockedUntil = undefined;
      }
    }

    // Simulate password validation
    const isPasswordValid = password.length >= 6; // Simplified for demo
    
    if (!isPasswordValid) {
      user.loginAttempts += 1;
      
      if (user.loginAttempts >= this.config.maxLoginAttempts) {
        user.accountLocked = true;
        user.lockedUntil = new Date(Date.now() + this.config.lockoutDuration * 60 * 1000).toISOString();
        this.logAuditEvent('account_locked', 'auth', user.id, { 
          email, 
          loginAttempts: user.loginAttempts 
        }, deviceInfo?.ipAddress || '', deviceInfo?.userAgent || '');
        
        return { success: false, error: 'Account locked due to too many failed attempts' };
      }
      
      this.logAuditEvent('login_failed', 'auth', user.id, { 
        email, 
        loginAttempts: user.loginAttempts 
      }, deviceInfo?.ipAddress || '', deviceInfo?.userAgent || '');
      
      return { success: false, error: 'Invalid credentials' };
    }

    // Successful login
    user.loginAttempts = 0;
    user.accountLocked = false;
    user.lastLoginAt = new Date().toISOString();
    user.updatedAt = new Date().toISOString();

    // Create session
    const session: Session = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      deviceId: deviceInfo?.deviceId || 'unknown',
      ipAddress: deviceInfo?.ipAddress || 'unknown',
      userAgent: deviceInfo?.userAgent || 'unknown',
      expiresAt: new Date(Date.now() + this.config.sessionTimeout * 60 * 1000).toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString()
    };

    this.sessions.set(session.id, session);

    // Register device if not already registered
    if (deviceInfo && !user.devices.find(d => d.deviceId === deviceInfo.deviceId)) {
      const newDevice: AuthDevice = {
        id: `device_${Date.now()}`,
        deviceId: deviceInfo.deviceId,
        deviceType: deviceInfo.deviceType,
        deviceName: deviceInfo.deviceName,
        userAgent: deviceInfo.userAgent,
        ipAddress: deviceInfo.ipAddress,
        lastUsedAt: new Date().toISOString(),
        isTrusted: false,
        createdAt: new Date().toISOString()
      };
      user.devices.push(newDevice);
    }

    this.logAuditEvent('login_success', 'auth', user.id, { email }, deviceInfo?.ipAddress || '', deviceInfo?.userAgent || '');

    return { success: true, user, session };
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(user: MerchantUser, permission: string): boolean {
    return user.permissions.includes(permission);
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(user: MerchantUser, roles: UserRole[]): boolean {
    return roles.some(role => user.roles.includes(role));
  }

  /**
   * Check if user has all of the specified roles
   */
  hasAllRoles(user: MerchantUser, roles: UserRole[]): boolean {
    return roles.every(role => user.roles.includes(role));
  }

  /**
   * Get permissions for roles
   */
  getRolePermissions(roles: UserRole[]): Permission[] {
    const allPermissions = new Set<Permission>();
    
    roles.forEach(roleId => {
      const role = this.roles.get(roleId);
      if (role) {
        role.permissions.forEach(permissionId => {
          // In a real implementation, we'd fetch the full permission object
          allPermissions.add({
            id: permissionId,
            name: permissionId,
            resource: permissionId.split('_')[0],
            action: 'read' as any,
            description: permissionId,
            category: 'payments' as any
          });
        });
      }
    });

    return Array.from(allPermissions);
  }

  /**
   * Create new merchant user
   */
  async createMerchantUser(userData: {
    email: string;
    name: string;
    password: string;
    roles: UserRole[];
    merchantProfile?: Partial<MerchantProfile>;
  }): Promise<MerchantUser> {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newUser: MerchantUser = {
      id: userId,
      email: userData.email,
      name: userData.name,
      isMerchant: true,
      roles: userData.roles,
      permissions: this.getRolePermissions(userData.roles),
      mfaEnabled: false,
      loginAttempts: 0,
      accountLocked: false,
      securityQuestions: [],
      devices: [],
      apiKeys: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.users.set(userId, newUser);

    // Create merchant profile if provided
    if (userData.merchantProfile) {
      const merchantProfile: MerchantProfile = {
        id: `profile_${Date.now()}`,
        userId,
        businessName: userData.merchantProfile.businessName || '',
        businessType: userData.merchantProfile.businessType || 'llc',
        registrationNumber: userData.merchantProfile.registrationNumber,
        taxId: userData.merchantProfile.taxId,
        website: userData.merchantProfile.website,
        phone: userData.merchantProfile.phone,
        address: userData.merchantProfile.address || {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: ''
        },
        businessCategory: userData.merchantProfile.businessCategory || 'other',
        monthlyVolume: userData.merchantProfile.monthlyVolume || 'under_10k',
        supportedCurrencies: userData.merchantProfile.supportedCurrencies || ['USD'],
        description: userData.merchantProfile.description,
        verificationStatus: 'pending',
        complianceLevel: 'basic',
        kycCompleted: false,
        riskLevel: 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.merchantProfiles.set(merchantProfile.id, merchantProfile);
      newUser.merchantProfile = merchantProfile;
    }

    this.logAuditEvent('user_created', 'users', userId, { 
      email: userData.email, 
      roles: userData.roles 
    });

    return newUser;
  }

  /**
   * Get merchant profile by user ID
   */
  getMerchantProfile(userId: string): MerchantProfile | null {
    return Array.from(this.merchantProfiles.values()).find(profile => profile.userId === userId) || null;
  }

  /**
   * Update merchant verification status
   */
  updateVerificationStatus(profileId: string, status: VerificationStatus): boolean {
    const profile = this.merchantProfiles.get(profileId);
    if (!profile) return false;

    profile.verificationStatus = status;
    profile.updatedAt = new Date().toISOString();

    if (status === 'approved') {
      profile.kycCompleted = true;
      profile.kycCompletedAt = new Date().toISOString();
    }

    this.logAuditEvent('verification_updated', 'merchant_profile', profileId, { status });
    return true;
  }

  /**
   * Create API key for merchant
   */
  createApiKey(userId: string, keyData: {
    name: string;
    permissions: Permission[];
    expiresAt?: string;
  }): ApiKey {
    const apiKey: ApiKey = {
      id: `api_key_${Date.now()}`,
      name: keyData.name,
      key: `mk_${Math.random().toString(36).substr(2, 32)}`,
      secret: `sk_${Math.random().toString(36).substr(2, 32)}`,
      permissions: keyData.permissions,
      expiresAt: keyData.expiresAt,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const user = this.users.get(userId);
    if (user) {
      user.apiKeys.push(apiKey);
      user.updatedAt = new Date().toISOString();
    }

    this.logAuditEvent('api_key_created', 'api', userId, { 
      apiKeyId: apiKey.id, 
      name: keyData.name 
    });

    return apiKey;
  }

  /**
   * Revoke API key
   */
  revokeApiKey(userId: string, apiKeyId: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    const apiKey = user.apiKeys.find(key => key.id === apiKeyId);
    if (!apiKey) return false;

    apiKey.isActive = false;
    user.updatedAt = new Date().toISOString();

    this.logAuditEvent('api_key_revoked', 'api', userId, { apiKeyId });
    return true;
  }

  /**
   * Log audit event
   */
  private logAuditEvent(action: string, resource: string, userId?: string, details?: Record<string, any>, ipAddress?: string, userAgent?: string): void {
    const auditLog: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: userId || '',
      action,
      resource,
      details: details || {},
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
      timestamp: new Date().toISOString(),
      status: 'success'
    };

    this.auditLogs.push(auditLog);
  }

  /**
   * Get audit logs for user
   */
  getAuditLogs(userId?: string, limit: number = 50): AuditLog[] {
    let logs = this.auditLogs;
    
    if (userId) {
      logs = logs.filter(log => log.userId === userId);
    }

    return logs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get active sessions for user
   */
  getUserSessions(userId: string): Session[] {
    return Array.from(this.sessions.values()).filter(session => 
      session.userId === userId && session.isActive
    );
  }

  /**
   * Terminate session
   */
  terminateSession(sessionId: string, userId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.userId !== userId) return false;

    session.isActive = false;
    this.logAuditEvent('session_terminated', 'auth', userId, { sessionId });
    return true;
  }

  /**
   * Get configuration
   */
  getConfig(): MerchantAuthConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<MerchantAuthConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Validate password against policy
   */
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const policy = this.config.passwordPolicy;

    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters long`);
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get security metrics for merchant
   */
  getSecurityMetrics(userId: string): {
    totalLogins: number;
    failedLogins: number;
    activeSessions: number;
    apiKeys: number;
    lastLogin: string | null;
    securityScore: number;
  } {
    const user = this.users.get(userId);
    if (!user) {
      return {
        totalLogins: 0,
        failedLogins: 0,
        activeSessions: 0,
        apiKeys: 0,
        lastLogin: null,
        securityScore: 0
      };
    }

    const userLogs = this.auditLogs.filter(log => log.userId === userId);
    const totalLogins = userLogs.filter(log => log.action === 'login_success').length;
    const failedLogins = userLogs.filter(log => log.action === 'login_failed').length;
    const activeSessions = this.getUserSessions(userId).length;
    const apiKeys = user.apiKeys.filter(key => key.isActive).length;

    // Calculate security score (0-100)
    let securityScore = 100;
    
    // Deduct for failed login attempts
    securityScore -= Math.min(failedLogins * 5, 30);
    
    // Deduct for no MFA
    if (!user.mfaEnabled) securityScore -= 20;
    
    // Deduct for expired sessions
    const expiredSessions = this.getUserSessions(userId).filter(session => 
      new Date(session.expiresAt) < new Date()
    ).length;
    securityScore -= Math.min(expiredSessions * 10, 20);

    securityScore = Math.max(0, securityScore);

    return {
      totalLogins,
      failedLogins,
      activeSessions,
      apiKeys,
      lastLogin: user.lastLoginAt || null,
      securityScore
    };
  }
}

// Export singleton instance
export const merchantAuthService = new MerchantAuthService();