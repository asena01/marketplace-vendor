import crypto from 'crypto';

/**
 * Tuya Smart Lock Service
 * Handles all smart lock device operations via Tuya IoT API
 */

const TUYA_API_BASE = 'https://openapi.tuyaus.com';
const TUYA_API_VERSION = '1.0';

class TuyaSmartLockService {
  constructor(clientId, clientSecret) {
    this.clientId = clientId || process.env.TUYA_CLIENT_ID;
    this.clientSecret = clientSecret || process.env.TUYA_CLIENT_SECRET;
    this.accessToken = null;
    this.tokenExpire = null;
  }

  /**
   * Generate signature for Tuya API requests
   */
  generateSignature(method, path, query = '', body = '', timestamp) {
    const stringToSign = [method, path, query, body].join('\n');
    const hash = crypto
      .createHmac('sha256', this.clientSecret)
      .update(stringToSign)
      .digest('hex')
      .toUpperCase();

    return `${this.clientId}${hash}`;
  }

  /**
   * Make authenticated request to Tuya API
   */
  async makeRequest(method, endpoint, body = null, query = '') {
    try {
      const timestamp = Date.now();
      const path = `/v${TUYA_API_VERSION}${endpoint}`;
      const signature = this.generateSignature(method, path, query, body ? JSON.stringify(body) : '', timestamp);

      const url = new URL(`${TUYA_API_BASE}${path}`);
      if (query) {
        url.search = query;
      }

      const headers = {
        'Content-Type': 'application/json',
        'Signature-Headers': 't',
        't': timestamp.toString(),
        'sign': signature,
        'client_id': this.clientId,
        'sign_method': 'HMAC-SHA256'
      };

      const response = await fetch(url.toString(), {
        method,
        headers,
        ...(body && { body: JSON.stringify(body) })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(`Tuya API Error: ${data.msg || 'Unknown error'}`);
      }

      return data.result;
    } catch (error) {
      console.error('❌ Tuya API request failed:', error);
      throw error;
    }
  }

  /**
   * Unlock a smart lock device
   * deviceId: Tuya device ID
   * method: 'password' | 'remote' | 'app'
   */
  async unlockDevice(deviceId, method = 'remote') {
    try {
      const endpoint = `/devices/${deviceId}/commands`;

      const body = {
        commands: [
          {
            code: 'lock',
            value: false // false = unlock
          }
        ]
      };

      const result = await this.makeRequest('POST', endpoint, body);
      console.log('✅ Device unlocked:', deviceId, result);
      return {
        success: true,
        deviceId,
        timestamp: new Date(),
        result
      };
    } catch (error) {
      console.error('❌ Failed to unlock device:', deviceId, error);
      return {
        success: false,
        deviceId,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Lock a smart lock device
   */
  async lockDevice(deviceId) {
    try {
      const endpoint = `/devices/${deviceId}/commands`;

      const body = {
        commands: [
          {
            code: 'lock',
            value: true // true = lock
          }
        ]
      };

      const result = await this.makeRequest('POST', endpoint, body);
      console.log('✅ Device locked:', deviceId, result);
      return {
        success: true,
        deviceId,
        timestamp: new Date(),
        result
      };
    } catch (error) {
      console.error('❌ Failed to lock device:', deviceId, error);
      return {
        success: false,
        deviceId,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Get device status (lock status, battery, etc.)
   */
  async getDeviceStatus(deviceId) {
    try {
      const endpoint = `/devices/${deviceId}/status`;
      const result = await this.makeRequest('GET', endpoint);

      const statusMap = {};
      if (Array.isArray(result)) {
        result.forEach(item => {
          statusMap[item.code] = item.value;
        });
      }

      return {
        success: true,
        deviceId,
        lockStatus: statusMap.lock !== undefined ? (statusMap.lock === false ? 'unlocked' : 'locked') : 'unknown',
        battery: statusMap.battery_percentage || null,
        rawStatus: statusMap,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ Failed to get device status:', deviceId, error);
      return {
        success: false,
        deviceId,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Add temporary access password for guest
   * expiresIn: duration in seconds (e.g., 86400 for 24 hours)
   */
  async addTemporaryAccess(deviceId, guestName, pin, expiresIn) {
    try {
      const endpoint = `/devices/${deviceId}/commands`;

      const body = {
        commands: [
          {
            code: 'add_temp_pwd',
            value: {
              temp_pwd: pin,
              temp_pwd_name: guestName,
              expire_time: Math.floor(Date.now() / 1000) + expiresIn
            }
          }
        ]
      };

      const result = await this.makeRequest('POST', endpoint, body);
      console.log('✅ Temporary access added:', deviceId, result);
      return {
        success: true,
        deviceId,
        guestName,
        pin,
        expiresIn,
        timestamp: new Date(),
        result
      };
    } catch (error) {
      console.error('❌ Failed to add temporary access:', deviceId, error);
      return {
        success: false,
        deviceId,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Remove temporary access password
   */
  async removeTemporaryAccess(deviceId, pin) {
    try {
      const endpoint = `/devices/${deviceId}/commands`;

      const body = {
        commands: [
          {
            code: 'delete_temp_pwd',
            value: pin
          }
        ]
      };

      const result = await this.makeRequest('POST', endpoint, body);
      console.log('✅ Temporary access removed:', deviceId);
      return {
        success: true,
        deviceId,
        pin,
        timestamp: new Date(),
        result
      };
    } catch (error) {
      console.error('❌ Failed to remove temporary access:', deviceId, error);
      return {
        success: false,
        deviceId,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Get device detail including battery, firmware version, etc.
   */
  async getDeviceDetail(deviceId) {
    try {
      const endpoint = `/devices/${deviceId}`;
      const result = await this.makeRequest('GET', endpoint);

      return {
        success: true,
        deviceId,
        deviceDetail: result,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ Failed to get device detail:', deviceId, error);
      return {
        success: false,
        deviceId,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Get device event log
   */
  async getDeviceLog(deviceId, startTime, endTime) {
    try {
      const endpoint = `/devices/${deviceId}/logs`;
      const query = `start_time=${startTime}&end_time=${endTime}`;
      const result = await this.makeRequest('GET', endpoint, null, query);

      return {
        success: true,
        deviceId,
        logs: result,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ Failed to get device log:', deviceId, error);
      return {
        success: false,
        deviceId,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Check if device is online
   */
  async isDeviceOnline(deviceId) {
    try {
      const status = await this.getDeviceStatus(deviceId);
      return status.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Send custom command to device
   */
  async sendCommand(deviceId, code, value) {
    try {
      const endpoint = `/devices/${deviceId}/commands`;

      const body = {
        commands: [
          {
            code,
            value
          }
        ]
      };

      const result = await this.makeRequest('POST', endpoint, body);
      console.log('✅ Command sent:', deviceId, code);
      return {
        success: true,
        deviceId,
        command: code,
        timestamp: new Date(),
        result
      };
    } catch (error) {
      console.error('❌ Failed to send command:', deviceId, error);
      return {
        success: false,
        deviceId,
        error: error.message,
        timestamp: new Date()
      };
    }
  }
}

// Export singleton instance
export default new TuyaSmartLockService();
