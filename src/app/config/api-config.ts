/**
 * API Configuration Service
 * Determines base URLs dynamically based on environment
 */

export interface ApiConfig {
  apiBaseUrl: string;
  uploadBaseUrl: string;
  environment: 'development' | 'production';
}

export class ApiConfigService {
  private static instance: ApiConfigService;
  private config: ApiConfig;

  private constructor() {
    this.config = this.detectEnvironment();
  }

  static getInstance(): ApiConfigService {
    if (!ApiConfigService.instance) {
      ApiConfigService.instance = new ApiConfigService();
    }
    return ApiConfigService.instance;
  }

  /**
   * Detect environment and set appropriate URLs
   */
  private detectEnvironment(): ApiConfig {
    const hostname = window.location.hostname;
    const port = window.location.port;
    const protocol = window.location.protocol;

    // Development environment (localhost)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return {
        apiBaseUrl: 'http://localhost:5001',
        uploadBaseUrl: 'http://localhost:5001/uploads',
        environment: 'development'
      };
    }

    // Production environment
    // Update these URLs based on your production domain
    const productionDomain = 'https://api.yourdomain.com'; // Update with your domain
    return {
      apiBaseUrl: productionDomain,
      uploadBaseUrl: `${productionDomain}/uploads`,
      environment: 'production'
    };
  }

  /**
   * Get the full API configuration
   */
  getConfig(): ApiConfig {
    return this.config;
  }

  /**
   * Get API base URL
   */
  getApiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  /**
   * Get upload base URL (for serving images)
   */
  getUploadBaseUrl(): string {
    return this.config.uploadBaseUrl;
  }

  /**
   * Get current environment
   */
  getEnvironment(): 'development' | 'production' {
    return this.config.environment;
  }

  /**
   * Build a complete image URL
   * @param imagePath - Image path like '/uploads/products/filename.jpg' or 'products/filename.jpg'
   * @returns Complete image URL
   */
  buildImageUrl(imagePath: string): string {
    if (!imagePath) return '';

    // If it's already an absolute URL, return as-is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // If it starts with /uploads/, remove that part
    const cleanPath = imagePath.startsWith('/uploads/') 
      ? imagePath.substring('/uploads'.length) 
      : imagePath.startsWith('uploads/') 
        ? imagePath.substring('uploads'.length)
        : `/${imagePath}`;

    return `${this.getUploadBaseUrl()}${cleanPath}`;
  }

  /**
   * Build a complete API endpoint URL
   * @param endpoint - API endpoint like '/api/products' or 'api/products'
   * @returns Complete API URL
   */
  buildApiUrl(endpoint: string): string {
    if (!endpoint) return this.getApiBaseUrl();

    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.getApiBaseUrl()}${cleanEndpoint}`;
  }

  /**
   * Log current configuration (useful for debugging)
   */
  logConfiguration(): void {
    console.log('🔧 API Configuration:', {
      environment: this.config.environment,
      apiBaseUrl: this.config.apiBaseUrl,
      uploadBaseUrl: this.config.uploadBaseUrl,
      hostname: window.location.hostname
    });
  }
}

// Export singleton instance
export const apiConfig = ApiConfigService.getInstance();
