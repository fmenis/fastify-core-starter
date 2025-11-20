module.exports = {
  apps: [
    {
      name: "fastify-core-starter",
      cwd: "/opt/fastify-core-starter",
      script: "dis/server.js",
      node_args: "-r dotenv/config",
      exp_backoff_restart_delay: 100,
      max_memory_restart: "500M",
      max_restarts: 10,
      error_file: "/var/log/fastify-core-starter/err.log",
      out_file: "/var/log/fastify-core-starter/out.log",
      log_file: "/var/log/fastify-core-starter/combined.log",
    },
  ],
};
