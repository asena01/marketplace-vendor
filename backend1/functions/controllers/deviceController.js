import { TuyaContext } from "@tuya/tuya-connector-nodejs";

const TUYA_ACCESS_KEY = process.env.TUYA_ACCESS_KEY || "uacrm8an77hjqghy7qug";
const TUYA_SECRET_KEY = process.env.TUYA_SECRET_KEY || "59c473f01d2f4ca3ba7cb77ccd258661";
const TUYA_REGION = process.env.TUYA_REGION || "https://openapi.tuyaeu.com";

const context = new TuyaContext({
    baseUrl: TUYA_REGION,
    accessKey: TUYA_ACCESS_KEY,
    secretKey: TUYA_SECRET_KEY,
});

/**
 * Get device status from Tuya
 * GET /hotels/:hotelId/devices/:deviceId/status
 */
const getDeviceStatus = async (req, res) => {
    const { deviceId } = req.params;
    try {
        console.log(`📱 Fetching status for device: ${deviceId}`);
        
        const response = await context.request({
            path: `/v1.0/devices/${deviceId}/status`,
            method: 'GET',
        });
        
        if (response.success) {
            console.log(`✅ Device status retrieved:`, response.result);
            res.status(200).json({
                status: 'success',
                data: response.result,
                deviceId
            });
        } else {
            console.error(`❌ Failed to fetch device status:`, response.msg);
            res.status(400).json({ 
                status: 'error',
                error: response.msg,
                message: "Failed to fetch device status"
            });
        }
    } catch (error) {
        console.error("❌ Error fetching device status:", error.message);
        res.status(500).json({ 
            status: 'error',
            error: "Failed to fetch device status",
            message: error.message
        });
    }
};

/**
 * Get device logs from Tuya
 * GET /hotels/:hotelId/devices/:deviceId/logs
 * Query params: start_time, end_time, codes
 */
const getDeviceLogs = async (req, res) => {
    const { deviceId } = req.params;
    const { start_time, end_time, codes } = req.query;
    
    try {
        console.log(`📋 Fetching logs for device: ${deviceId}`);

        const buildQuery = (mode = 'full') => {
            const query = { size: mode === 'fallback' ? 20 : 100 };

            if (mode === 'full') {
                if (start_time && !Number.isNaN(Number(start_time))) {
                    query.start_time = String(start_time);
                }

                if (end_time && !Number.isNaN(Number(end_time))) {
                    query.end_time = String(end_time);
                }

                if (typeof codes === 'string' && codes.trim().length > 0) {
                    query.codes = codes.trim();
                }
            }

            return query;
        };

        const requestLogs = async (query) => context.request({
            path: `/v2.0/cloud/thing/${deviceId}/report-logs`,
            method: 'GET',
            query,
        });

        let response = await requestLogs(buildQuery('full'));

        if (!response.success && String(response.msg || '').toLowerCase().includes('illegal param')) {
            console.warn(`⚠️ Tuya rejected full log query for ${deviceId}, retrying with minimal params`);
            response = await requestLogs(buildQuery('fallback'));
        }
        
        if (response.success) {
            let logs = response.result?.logs;
            
            if (!logs || logs.length === 0) {
                return res.status(200).json({
                    status: 'success',
                    deviceId,
                    logs: [],
                    totalLogs: 0,
                    timeDifferences: [],
                    message: "No logs found for the specified device and time range."
                });
            }
            
            // Sort logs by event_time
            logs = logs.sort((a, b) => a.event_time - b.event_time);
            
            // Calculate durations between consecutive "true" events
            const timeDifferences = calculateTrueToTrueDurations(logs);
            
            console.log(`✅ Device logs retrieved: ${logs.length} logs, ${timeDifferences.length} periods`);
            
            return res.status(200).json({
                status: 'success',
                deviceId,
                logs,
                totalLogs: logs.length,
                timeDifferences,
                message: `Retrieved ${logs.length} logs and calculated ${timeDifferences.length} time periods`
            });
        } else {
            console.error(`❌ Failed to fetch device logs:`, response.msg);
            return res.status(200).json({
                status: 'success',
                deviceId,
                logs: [],
                totalLogs: 0,
                timeDifferences: [],
                message: response.msg === 'illegal param'
                    ? 'This device does not expose report logs through the Tuya log endpoint.'
                    : response.msg
            });
        }
    } catch (error) {
        console.error("❌ Error fetching device logs:", error.message);
        return res.status(500).json({ 
            status: 'error',
            error: "Failed to fetch device logs",
            message: error.message
        });
    }
};

/**
 * Helper function to calculate durations between consecutive "true" events
 * Filters for motion sensor "true" states that last more than 20 minutes
 */
const calculateTrueToTrueDurations = (logs) => {
    const periods = [];
    const TIME_THRESHOLD = 20 * 60 * 1000; // 20 minutes in milliseconds
    
    // Filter only logs where code is "doorcontact_state" and value is "true"
    const trueLogs = logs.filter(log => 
        log.code === "doorcontact_state" && log.value === "true"
    );
    
    console.log(`🔍 Found ${trueLogs.length} "true" events for duration calculation`);
    
    // Calculate time difference between consecutive "true" values
    for (let i = 0; i < trueLogs.length - 1; i++) {
        const start = trueLogs[i].event_time;
        const end = trueLogs[i + 1].event_time;
        const duration = Math.abs(end - start);
        
        if (duration > TIME_THRESHOLD) {
            periods.push({
                start: new Date(start),
                end: new Date(end),
                duration: Math.round(duration / (60 * 1000)), // Convert to minutes
                durationHours: Math.round((duration / (60 * 1000)) / 60 * 100) / 100 // Convert to hours
            });
        }
    }
    
    console.log(`📊 Calculated ${periods.length} periods exceeding 20 minutes threshold`);
    return periods;
};

/**
 * Get device shadow properties from Tuya
 * GET /hotels/:hotelId/devices/:deviceId/shadow
 */
const getDeviceShadowProperties = async (req, res) => {
    const { deviceId } = req.params;
    
    try {
        console.log(`🔐 Fetching shadow properties for device: ${deviceId}`);
        
        const response = await context.request({
            path: `/v2.0/cloud/thing/${deviceId}/shadow/properties`,
            method: 'GET',
        });
        
        if (response.success) {
            console.log(`✅ Device shadow properties retrieved`);
            res.status(200).json({
                status: 'success',
                data: response.result,
                deviceId
            });
        } else {
            console.error(`❌ Failed to fetch shadow properties:`, response.msg);
            res.status(400).json({ 
                status: 'error',
                error: response.msg,
                message: "Failed to fetch device shadow properties"
            });
        }
    } catch (error) {
        console.error("❌ Error fetching device shadow properties:", error.message);
        res.status(500).json({ 
            status: 'error',
            error: "Failed to fetch device shadow properties",
            message: error.message
        });
    }
};

/**
 * Get all devices from Tuya
 * GET /devices (admin only)
 */
const getAllDevices = async (req, res) => {
    try {
        console.log(`📱 Fetching all devices from Tuya`);
        
        const response = await context.request({
            path: '/v2.0/cloud/thing/device',
            method: 'GET',
            query: {
                page_size: 100,
            },
        });
        
        if (response.success) {
            console.log(`✅ Retrieved ${response.result?.list?.length || 0} devices`);
            res.status(200).json({
                status: 'success',
                data: response.result,
                totalDevices: response.result?.list?.length || 0
            });
        } else {
            console.error(`❌ Failed to fetch devices:`, response.msg);
            res.status(400).json({ 
                status: 'error',
                error: response.msg,
                message: "Failed to fetch devices"
            });
        }
    } catch (error) {
        console.error("❌ Error fetching all devices:", error.message);
        res.status(500).json({ 
            status: 'error',
            error: "Failed to fetch all devices",
            message: error.message
        });
    }
};

export {
    getDeviceStatus,
    getDeviceLogs,
    getDeviceShadowProperties,
    getAllDevices,
    calculateTrueToTrueDurations
};
