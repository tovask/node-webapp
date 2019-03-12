
// pm2 start npm --watch --ignore-watch="static" --name "mynodeproject" -- run start-dev

module.exports = {
  apps : [{
    name: 'mynodeproject',
    script: 'npm',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    args: 'run start-dev',
    
    watch: true,
    "ignore_watch" : ["static"],
    
    /*env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
  }*/
  }]
};
