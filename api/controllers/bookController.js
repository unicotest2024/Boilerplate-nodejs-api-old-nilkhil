module.exports = {

    addBook: function (req, callback) {

        // Build insert data only
        const data = {
            title: req.title,
            author: req.author,
            price: req.price,
            stock: req.stock,
            category_id: req.category_id,
            blocked: "false",
            created_by: req.created_by || null,
            updated_by: req.created_by || null,
            created_at: new Date(),
            updated_at: new Date()
        };

        //Insert into DB using helper
        db_insertQ1("books", data, function (insertId, errCode, errMsg) {

            if (!insertId) {
                return callback({
                    status: false,
                    msg: "Book insert failed",
                    error_code: errCode,
                    error_msg: errMsg
                });
            }

            return callback({
                id: insertId
            });
        });
    },

    listBooks: function (req, callback) {
        try {
            //Pagination
            let page = parseInt(req.page || req.query?.page || 1);
            let limit = parseInt(req.limit || req.query?.limit || 10);
            let blocked = 'false'

            if (page < 1) page = 1;
            if (limit < 1) limit = 10;

            let offset = (page - 1) * limit;

            //Count total books
            db_selectQ(
                "books b LEFT JOIN categories c ON c.id = b.category_id",
                "COUNT(*) AS total",
                { "b.blocked": "false" },
                null,
                function (countResult) {
                    //console.log({ countResult });

                    if (!countResult) {
                        return callback({
                            status: true,
                            msg: "No books found",
                            total: 0,
                            data: []
                        });
                    }

                    const totalBooks = countResult[0].total;

                    //Get paginated book list with JOIN
                    const columns = [
                        "b.id",
                        "b.title",
                        "b.author",
                        "b.price",
                        "b.stock",
                        "b.blocked",
                        "b.category_id",
                        "c.name AS category_name"
                    ];

                    const where = { "b.blocked": "false" };
                    const whereParams = [offset, limit];

                    const extraQuery =
                        
                        " ORDER BY b.id DESC LIMIT ?, ?";

                    db_selectQ(
                        "books b LEFT JOIN categories c ON c.id = b.category_id ",
                        columns,
                        where,
                        whereParams,
                        function (results) {
                            // console.log({ results });

                            return callback({
                                status: true,
                                msg: "Books fetched successfully",
                                page: page,
                                limit: limit,
                                total: totalBooks,
                                data: results || []
                            });
                        },
                        extraQuery
                    );

                }
            );

        } catch (err) {
            console.log("List Books Error:", err);
            return callback({
                status: false,
                msg: "Internal Server Error"
            });
        }
    },

    getBook: function (req, callback) {
        try {
            const bookId = req.params.id;

            if (!bookId || isNaN(bookId)) {
                return callback({
                    status: false,
                    msg: "Invalid book ID"
                });
            }

            const columns = [
                "b.id",
                "b.title",
                "b.author",
                "b.price",
                "b.stock",
                "b.blocked",
                "b.category_id",
                "c.name AS category_name"
            ];

            const where = "b.id = ? and b.blocked = ?";
            const whereParams = [bookId, 'false'];

            db_selectQ(
                "books b LEFT JOIN categories c ON c.id = b.category_id",
                columns,
                where,
                whereParams,
                function (result) {
                    if (!result || result.length === 0) {
                        return callback({
                            status: false,
                            msg: "Book not found",
                            data: null
                        });
                    }

                    return callback({
                        status: true,
                        msg: "Book fetched successfully",
                        data: result[0]
                    });
                },
                "" // no extra query
            );

        } catch (err) {
            console.log("Get Book Error:", err);
            return callback({
                status: false,
                msg: "Internal Server Error"
            });
        }
    },

updateBookById: function (req, callback) {

    const bookId = req.id || req.book_id || req.body.id;

    if (!bookId) {
        return callback({
            status: false,
            msg: "Book ID is required"
        });
    }

    //Build update data (only include fields if provided)
    const data = {};

    if (req.title) data.title = req.title;
    if (req.author) data.author = req.author;
    if (req.price) data.price = req.price;
    if (req.stock) data.stock = req.stock;
    if (req.blocked !== undefined) data.blocked = req.blocked;

    data.updated_by = req.updated_by || null;
    data.updated_at = moment().format("YYYY-MM-DD HH:mm:ss");

    console.log(data);
    

    if (Object.keys(data).length === 0) {
        return callback({
            status: false,
            msg: "No fields to update"
        });
    }

    db_updateQ(
        "books",
        data,
        bookId ,   //
        function (results) {
            if (!results) {
                return callback({
                    status: false,
                    msg: "Failed to update book"
                });
            }

            return callback({
                status: true,
                msg: "Book updated successfully"
            });
        }
    );
}

};
