const http = require("http");
const url = require("url");

let users = [
  { id: 1, name: "Minh" },
  { id: 2, name: "Tuan" },
];

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
  });

  res.end(JSON.stringify(data));
}

function getBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", () => {
      if (!body) return resolve(null);

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  try {
    // GET /
    if (method === "GET" && path === "/") {
      return sendJSON(res, 200, {
        message: "Basic API Server is running",
      });
    }

    // GET /users
    if (method === "GET" && path === "/users") {
      return sendJSON(res, 200, users);
    }

    // GET /users/:id
    if (method === "GET" && path.startsWith("/users/")) {
      const id = Number(path.split("/")[2]);
      const user = users.find(u => u.id === id);

      if (!user) {
        return sendJSON(res, 404, {
          message: "User not found",
        });
      }

      return sendJSON(res, 200, user);
    }

    // POST /users
    if (method === "POST" && path === "/users") {
      const body = await getBody(req);

      if (!body || !body.name) {
        return sendJSON(res, 400, {
          message: "Name is required",
        });
      }

      const newUser = {
        id: users.length + 1,
        name: body.name,
      };

      users.push(newUser);

      return sendJSON(res, 201, newUser);
    }

    // PUT /users/:id
    if (method === "PUT" && path.startsWith("/users/")) {
      const id = Number(path.split("/")[2]);
      const body = await getBody(req);

      const user = users.find(u => u.id === id);

      if (!user) {
        return sendJSON(res, 404, {
          message: "User not found",
        });
      }

      if (!body || !body.name) {
        return sendJSON(res, 400, {
          message: "Name is required",
        });
      }

      user.name = body.name;

      return sendJSON(res, 200, user);
    }

    // DELETE /users/:id
    if (method === "DELETE" && path.startsWith("/users/")) {
      const id = Number(path.split("/")[2]);
      const index = users.findIndex(u => u.id === id);

      if (index === -1) {
        return sendJSON(res, 404, {
          message: "User not found",
        });
      }

      users.splice(index, 1);

      return sendJSON(res, 204, {});
    }

    // Route not found
    return sendJSON(res, 404, {
      message: "Route not found",
    });

  } catch (error) {
    if (error.message === "Invalid JSON") {
      return sendJSON(res, 400, {
        message: "Invalid JSON body",
      });
    }

    return sendJSON(res, 500, {
      message: "Internal server error",
    });
  }
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
