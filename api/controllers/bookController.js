module.exports = {

    addBook: function (req, callback) {

        //Validate input
        const rules = {
            title: "required",
            author: "required",
            price: "required|numeric",
            stock: "required|numeric",
            category_id: "required|numeric"
        };

        const validation = validateRule(req, rules);

        if (!validation.status) {
            return callback({
                status: false,
                errors: validation.errors
            });
        }

        //Build insert data
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

        //Insert into DB using your helper
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
                status: true,
                msg: "Book added successfully",
                id: insertId
            });

        });
    },

    listBooks: function (req, callback) {
        try {
            //Pagination
            let page = parseInt(req.page || req.query?.page || 1);
            let limit = parseInt(req.limit || req.query?.limit || 10);

            if (page < 1) page = 1;
            if (limit < 1) limit = 10;

            let offset = (page - 1) * limit;

            //Count total books
            db_selectQ(
                "books b LEFT JOIN categories c ON c.id = b.category_id",
                "COUNT(*) AS total",
                null,
                null,
                function (countResult) {
                    console.log({ countResult });

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
                        "c.name AS category_name"
                    ];

                    const where = null;
                    const whereParams = [offset, limit];

                    const extraQuery =
                        " LEFT JOIN categories c ON c.id = b.category_id " +
                        " ORDER BY b.id DESC LIMIT ?, ?";

                    db_selectQ(
                        "books b",
                        columns,
                        where,
                        whereParams,
                        function (results) {
                            console.log({ results });

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
    }

};
