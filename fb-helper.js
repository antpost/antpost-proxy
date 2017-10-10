class FbHelper {
    async login(username, password) {
        const options = {
            method: 'POST',
            rejectUnauthorized: false,
            uri: 'https://api.facebook.com/restserver.php',
            form: req.body,
            json: true
        };

        return await request(options);
    }
}

module.exports = new FbHelper();