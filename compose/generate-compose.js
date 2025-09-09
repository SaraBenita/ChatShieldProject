const fs = require('fs');
const { execSync } = require('child_process');

const basePort = 5900;

function generateDockerCompose(numChildren) {
  const services = {};
  const volumes = {};

  for (let i = 1; i <= numChildren; i++) {
    const name = `child${i}`;
    const port = basePort + i;
    const volume = `chrome-profile-${name}`;

    services[name] = {
      image: 'chatshield-wa-vnc',
      container_name: name,
      ports: [`${port}:5900`],
      volumes: [`${volume}:/app/chrome-profile`],
      restart: 'unless-stopped',
    };

    volumes[volume] = null;
  }

  return {
    version: '3',
    services,
    volumes,
  };
}

function saveComposeFile(data, filename = 'docker-compose.yml') {
  const yaml = require('js-yaml');
  const content = yaml.dump(data, { noCompatMode: true, lineWidth: -1 });
  fs.writeFileSync(filename, content);
  console.log(`✅ Saved ${filename}`);
}

function runDockerCompose() {
  try {
    console.log('🚀 Running docker-compose up -d ...');
    execSync('docker-compose up -d', { stdio: 'inherit' });
  } catch (err) {
    console.error('❌ Error during execution:', err.message);
  }
}

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.question('How many child containers to run? ', (answer) => {
  const num = parseInt(answer);
  if (isNaN(num) || num <= 0) {
    console.log('❌ Invalid number');
    return readline.close();
  }

  const composeData = generateDockerCompose(num);
  saveComposeFile(composeData);

  readline.question('Start containers now? [y/N] ', (run) => {
    if (run.toLowerCase() === 'y') {
      runDockerCompose();
    } else {
      console.log('👌 Compose file created. You can run: docker-compose up -d');
    }
    readline.close();
  });
});
