const model = require('../models/model');

async function create_Categories(req, res) {
  try {
      const Create = new model.Categories({
          type: "Investment",
          color: "#FCBE44",
      });

      const savedCategory = await Create.save();
      return res.status(201).json(savedCategory);
  } catch (error) {
      console.error("Error creating category:", error);
      return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function get_Categories(req, res) {
    let data = await model.Categories.find({});
    let filter = data.map(v => ({ type: v.type, color: v.color }));
    return res.json(filter);
}

async function create_Transaction(req, res) {
    if (!req.body) return res.status(400).json("Post HTTP Data not provided");
    let { name, type, amount } = req.body;

    const create = await new model.Transaction({
        name,
        type,
        amount,
        date: new Date(),
    });

    create.save(function (err) {
        if (!err) return res.json(create);
        return res.status(400).json({ message: `Error while creating transaction ${err}` });
    });
}

async function get_Transaction(req, res) {
    let data = await model.Transaction.find({});
    return res.json(data);
}

async function delete_Transaction(req, res) {
  try {
      if (!req.body) return res.status(400).json({ message: "Request Body not Found" });

      await model.Transaction.deleteOne(req.body);
      return res.json({ message: "Record Deleted" });
  } catch (error) {
      console.error("Error deleting transaction:", error);
      return res.status(500).json({ message: "Internal Server Error" });
  }
}


async function get_Labels(req, res) {
  try {
      const result = await model.Transaction.aggregate([
          {
              $lookup: {
                  from: "categories",
                  localField: 'type',
                  foreignField: "type",
                  as: "categories_info"
              }
          },
          {
              $unwind: "$categories_info"
          }
      ]);

      const data = result.map(v => ({
          _id: v._id,
          name: v.name,
          type: v.type,
          amount: v.amount,
          color: v.categories_info['color']
      }));

      res.json(data);
  } catch (error) {
      console.error("Error fetching labels:", error);
      return res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = {
    create_Categories,
    get_Categories,
    create_Transaction,
    get_Transaction,
    delete_Transaction,
    get_Labels
}
