import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export const startMonitoring = async (req, res) => {
  try {
    const { phone, index } = req.body;
    const name = phone;
    const containerName = `child-monitor-${name}`;
    const volumeName = `volume-${containerName}`;
    const image = 'chatshield-wa-vnc';
    const hostPortVNC = 5900 + index;
    const hostPortWeb = 6080 + index;

    const { stdout: allContainers } = await execAsync(`docker ps -a --format "{{.Names}}"`);
    const containerExists = allContainers.split('\n').includes(containerName);

    if (containerExists) {
      const { stdout: runningContainers } = await execAsync(`docker ps --format "{{.Names}}"`);
      const isRunning = runningContainers.split('\n').includes(containerName);

      if (isRunning) {
        return res.status(400).json({ error: 'Container already running' });
      }

      await execAsync(`docker start ${containerName}`);
      return res.json({ message: 'Monitoring resumed' });
    }

    await execAsync(`docker volume create ${volumeName}`);

    const volumeFlag = `-v ${volumeName}:/app/chrome-profile`;
    const ports = `-p ${hostPortVNC}:5900 -p ${hostPortWeb}:6080`;
    const command = `docker run -d --name ${containerName} ${ports} ${volumeFlag} ${image}`;
    console.log('Running command:', command);

    await execAsync(command);
    res.json({ message: 'Monitoring started' });
  } catch (err) {
    console.error('Start error:', err.message);
    res.status(500).json({ error: 'Failed to start container' });
  }
};

export const stopMonitoring = async (req, res) => {
  try {
    const { phone } = req.body;
    const name = phone;
    const containerName = `child-monitor-${name}`;

    const { stdout: running } = await execAsync(`docker ps --format "{{.Names}}"`);
    if (!running.split('\n').includes(containerName)) {
      return res.status(400).json({ error: 'Container already stopped' });
    }

    await execAsync(`docker stop ${containerName}`);
    res.json({ message: 'Monitoring stopped' });
  } catch (err) {
    console.error('Stop error:', err.message);
    res.status(500).json({ error: 'Failed to stop container' });
  }
};

export const getContainerStatus = async (req, res) => {
  try {
    const { phone } = req.query;
    const name = phone;
    const containerName = `child-monitor-${name}`;

    const { stdout } = await execAsync(`docker ps --format "{{.Names}}"`);
    const isRunning = stdout.split('\n').includes(containerName);

    res.json({ isRunning });
  } catch (err) {
    console.error('Status error:', err.message);
    res.status(500).json({ error: 'Failed to get status' });
  }
};
