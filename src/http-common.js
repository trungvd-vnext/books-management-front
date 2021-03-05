import axios from "axios";

export default axios.create({
  baseURL: "http://books-management-env.eba-pztmcypw.ap-southeast-1.elasticbeanstalk.com/api/books/api",
  headers: {
    "Content-type": "application/json"
  }
});
