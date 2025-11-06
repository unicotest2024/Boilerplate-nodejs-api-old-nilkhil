module.exports = function (server, restify) {

    // Add Book
    server.post('/book/add', (req, res, next) => {

        BOOKCONTROLLER.addBook(req.body, function (response) {
            const status = response.status ? 200 : 401;
            res.send(status, response);
            next();
        });

    });

    server.get('/book/list', (req, res, next) => {

        BOOKCONTROLLER.listBooks(req, function (response) {

            const status = response.status ? 200 : 401;

            res.send(status, response);
            next();
        });

    });


};





