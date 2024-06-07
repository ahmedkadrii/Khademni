const mongoose = require('mongoose');

// List of 24 Tunisia cities
const tunisiaCities = ["Tunis","Sfax","Sousse","Ettadhamen","Kairouan","Bizerte","Gabes","Ariana","Gafsa","El Mourouj","Kasserine", "Medenine","Monastir","La Goulette",
 "Tozeur","Douane", "Korba", "La Marsa", "Gremda", "Jendouba", "Zarzis", "Hammam-Lif", "Mateur"
];

const domainNames = ["Information Technology","Finance","Healthcare","Education","Marketing","Engineering","Sales","Customer Service","Human Resources","Design","Consulting","Management",
"Manufacturing","Research","Hospitality","Real Estate","Media","Transportation","Logistics","Legal","Nonprofit",]

const types = ["Full Time", "Part Time", "Remote", "Freelancer"];
const exp = ["Internship", "2+ Years", "5+ Years", "Fresher"];

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  salary: {
    minSalary: {
      type: Number,
      required: true
    },
    maxSalary: {
      type: Number,
      required: true
    }
  },
domains: {
  type: [String],
  enum: domainNames,
  required: true
},

types: {
  type: [String],
  enum: types,
  required: true
},
createdBy: {
  type: mongoose.Schema.Types.ObjectId, // Reference to the Enterprise model
  ref: 'Enterprise', // Name of the Enterprise model
  required: true
},
exp: {
  type: [String],
  enum: exp,
  required: true
},
views: {
  type: Number,
  default: 0
},

viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of user IDs who viewed the job
viewedByIps: [{ type: String }], // Array of IP addresses who viewed the job



  cities: {
    type: [String], // Array of city names
    enum: tunisiaCities, // Ensure the city names are from the predefined list
    required: true
  },

  datePosted: {
    type: Date,
    default: Date.now
  },
  deadline: {
    type: Date,
    required: true
  },
  applications: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'JobApplication' 
  }] // Array of references to JobApplication documents

  // Add more fields as needed
});


// Middleware to delete job applications associated with the job when the job is deleted
jobSchema.pre('remove', async function(next) {
  try {
    console.log('Pre-hook middleware: Deleting job applications...');
    await JobApplication.deleteMany({ jobId: this._id });
    console.log('Job applications deleted.');

    next();
  } catch (error) {
    next(error);
  }
});




const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
