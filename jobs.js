const ns = require("node-schedule");
const jobJSON = require("./jobs.json");
const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const pathToFile = path.join(__dirname, "./jobs.json");

const users = [
  {
    id: 1,
    name: "HASAN",
  },
  {
    id: 2,
    name: "UMER",
  },
];

const getUserById = (id) => {
  // api call to get user data

  return users.find((i) => i.id === id);
};

const getUserByIdAndName = (id, name) => {
  // api call to get user data
  return users.find((i) => i.id === id && i.name === name);
};

const jobCallback = {
  "get-user-name-by-id": {
    name: "get-user-name-by-id",
    callback: ({ id }) => {
      console.log("get-user-name-by-id", id);

      const user = getUserById(id);
      console.log(user);
      console.log(user?.name || null);
    },
  },
  "get-user-by-id-and-name": {
    name: "get-user-by-id-and-name",
    callback: ({ id, name }) => {
      console.log("get-user-by-id-and-name", id, name);
      const user = getUserByIdAndName(id, name);
      console.log(user);
    },
  },
  "check-user-by-id": {
    name: "check-user-by-id",
    callback: ({ id }) => {
      console.log("check-user-by-id", id);
      const user = getUserById(id);
      !!user ? console.log("User exists") : console.log("User does not exists");
    },
  },
};

const schudleAJob = (name, rule, funcName, inputs) => {
  ns.scheduleJob(name, rule, () => {
    jobCallback[funcName].callback(inputs);
  });

  if (jobJSON.find((jj) => jj.name === name)) {
    console.log("Job already running");
    return;
  }

  // file write

  jobJSON.push({
    name,
    rule,
    funcName,
    inputs: JSON.stringify(inputs),
  });

  fs.writeFile(
    pathToFile,
    JSON.stringify(jobJSON, null, 2),
    function writeJSON(err) {
      if (err) {
        console.log(err);
        console.log("Failed to add new job to file");
      } else {
        console.log("Job added to file successfully");
      }
    }
  );
};

const loadCronJobs = () => {
  if (jobJSON.length) {
    jobJSON.forEach((job) => {
      ns.scheduleJob(job.name, job.rule, () => {
        jobCallback[job.funcName].callback(JSON.parse(job.inputs));
      });
    });
  }
};

if (jobJSON.length) {
  loadCronJobs();
} else {
  schudleAJob(uuid(), "* * * * * *", "get-user-name-by-id", {
    id: 1,
  });

  schudleAJob(uuid(), "* * * * * *", "get-user-by-id-and-name", {
    id: 2,
    name: "UMER",
  });

  schudleAJob(uuid(), "* * * * * *", "check-user-by-id", {
    id: 4,
  });
}
