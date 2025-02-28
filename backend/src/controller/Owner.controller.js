const Owner = require('../model/OwnerSchema.model');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage }).single('logo');

const addOwner = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Multer Error:', err);
      return res.status(400).json({ message: 'Error uploading file', error: err.message });
    }

    try {
      const {
        companyName,
        ownerName,
        contactNumber,
        emailAddress,
        website,
        businessRegistration,
        companyType,
        employeeSize,
        panNumber,
        documentType,
        documentNumber,
      } = req.body;

      // Replace backslashes with forward slashes in the logo path
      const logoPath = req.file ? req.file.path.replace(/\\/g, '/') : null;

      const newOwner = new Owner({
        logo: logoPath,
        companyName,
        ownerName,
        contactNumber,
        emailAddress,
        website,
        businessRegistration,
        companyType,
        employeeSize,
        panNumber,
        documentType,
        documentNumber,
        dataFilled: true,
      });

      await newOwner.save();
      res.status(201).json({ message: 'Owner added successfully', data: newOwner, datafilled: true });
    } catch (error) {
      console.error('Backend Error:', error);
      res.status(400).json({ message: 'Error adding owner', error: error.message });
    }
  });
};

const updateOwner = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedOwner = await Owner.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedOwner) {
      return res.status(404).json({ message: 'Owner not found' });
    }
    res.status(200).json({ message: 'Owner updated successfully', data: updatedOwner });
  } catch (error) {
    res.status(400).json({ message: 'Error updating owner', error: error.message });
  }
};

// Get all owners
const getOwners = async (req, res) => {
  try {
    const owners = await Owner.find();
    res.status(200).json({ message: 'Owners fetched successfully', data: owners });
  } catch (error) {
    res.status(400).json({ message: 'Error fetching owners', error: error.message });
  }
};

// Get a specific owner by ID
// const getOwnerById = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const owner = await Owner.findById(id);
//     if (!owner) {
//       return res.status(404).json({ message: 'Owner not found' });
//     }
//     res.status(200).json({ message: 'Owner fetched successfully', data: owner });
//   } catch (error) {
//     res.status(400).json({ message: 'Error fetching owner', error: error.message });
//   }
// };

// Delete an owner
const deleteOwner = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedOwner = await Owner.findByIdAndDelete(id);
    if (!deletedOwner) {
      return res.status(404).json({ message: 'Owner not found' });
    }
    res.status(200).json({ message: 'Owner deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting owner', error: error.message });
  }
};

// Get the count of owners
const getOwnerCount = async (req, res) => {
  try {
    const count = await Owner.countDocuments();  // Get the count of owners in the database
    res.status(200).json({ count });
  } catch (error) {
    res.status(400).json({ message: 'Error fetching owner count', error: error.message });
  }
};

// Get owner data for generating invoice PDF
const getOwnerForInvoice = async (req, res) => {
  try {
    // Assuming the first owner is the one used for the invoice
    const owner = await Owner.findOne(); // You can modify this to fetch a specific owner if needed
    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }
    res.status(200).json({
      message: 'Owner data fetched successfully for invoice',
      data: {
        companyName: owner.companyName,
        contactNumber: owner.contactNumber,
        emailAddress: owner.emailAddress,
        gstNumber: owner.gstNumber,
        website: owner.website,
        logo : owner.logo
      },
    });
  } catch (error) {
    res.status(400).json({ message: 'Error fetching owner data for invoice', error: error.message });
  }
};

module.exports = {
  addOwner,
  updateOwner,
  getOwners,
  // getOwnerById,
  deleteOwner,
  getOwnerCount, 
  getOwnerForInvoice // Export the count function
};
 