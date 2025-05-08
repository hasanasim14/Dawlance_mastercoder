module.exports = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/master-coding",
        permanent: false,
      },
    ];
  },
};
