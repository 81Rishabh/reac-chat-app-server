class SessionStore {
    findSession(id) { }
    saveSession(id, session) { }
    findAllSessions() { }
}


class InMemorySessionStore extends SessionStore {
    constructor() {
        super();
        this.sessions = new Map();
        console.log("callled");
    }

    findSession(id) {
        return this.sessions.get(id);
    }

    saveSession(id, session) {
       this.sessions.set(id, session);
    }

    findAllSessions() {
        return [...this.sessions.values()];
    }
}


const SESSION_TTL = 24 * 60 * 60;
const mapSession = ([userID, username, isOnline]) => userID ? { userID, username, isOnline: isOnline === "true" } : undefined;

class RedisSessionStore extends SessionStore {
    constructor(redisClient) {
        super();
        this.redisClient = redisClient
    }

    findSession(id) {
        return this.redisClient
            .hmget(`session:${id}`, "userID", "username", "isOnline")
            .then(mapSession);
    }

    saveSession(id, { userID, username, isOnline }) {
        this.redisClient
            .multi()
            .hmset(`session:${id}`, 'userID', userID, 'username', username, 'isOnline', isOnline)
            .expire(`session:${id}`, SESSION_TTL)
            .exec();
    }
    async findAllSessions() {
        const keys = new Set();
        let nextIndex = 0;
        do {
            const [nextIndexAsStr, results] = await this.redisClient.scan(
                nextIndex,
                "MATCH",
                "session:*",
                "COUNT",
                "100"
            );
            nextIndex = parseInt(nextIndexAsStr, 10);
            results.forEach((s) => keys.add(s));
        } while (nextIndex !== 0);
        const commands = [];
        keys.forEach((key) => {
            commands.push(["hmget", key, "userID", "username", "isOnline"]);
        });
        return this.redisClient
            .multi(commands)
            .exec()
            .then((results) => {
                return results
                    .map(([err, session]) => (err ? undefined : mapSession(session)))
                    .filter((v) => !!v);
            });
    }

}

module.exports = {
    InMemorySessionStore,
    RedisSessionStore
}