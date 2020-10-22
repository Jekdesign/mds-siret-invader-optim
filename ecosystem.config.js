module.exports = {
  apps : [{
    name: 'main_script',
    script: 'index.js',
    exec_mode: 'cluster',
    out_file: './logs/pm2.log',
    error_file: './logs/pm2-errors.log',
    merge_logs: true
  }],
};
