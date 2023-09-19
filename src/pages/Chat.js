import React, { Component, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import { db } from "../services/firebase";

export default function Chat() {
  const { chatID } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(auth().currentUser);
  const [friendName, setFriendName] = useState(null);
  const [chats, setChats] = useState([]);
  const [content, setContent] = useState("");
  const [deletePrompt, setDeletePrompt] = useState(false);
  const [deletionMsgRef, setDeletionMsgRef] = useState("");
  const [readError, setReadError] = useState(null);
  const [writeError, setWriteError] = useState(null);
  const [loadingChats, setLoadingChats] = useState(false);

  const myRef = React.createRef();

  useEffect(() => {
    setLoadingChats(true);
    const chatArea = myRef.current;

    const fetchData = async () => {
      try {
        if (!chatID.split("_").includes(user.uid)) {
          navigate("/chat");
          throw new Error("You shouldn't be here 🤨");
        }

        const chatRef = db.ref(`chats/${chatID}`);
        chatRef.on("value", (snapshot) => {
          let chats = [];
          snapshot.forEach((snap) => {
            chats.push(snap.val());
          });
          chats.sort(function (a, b) {
            return a.timestamp - b.timestamp;
          });
          setChats(chats);
          setLoadingChats(false);
          chatArea.scrollBy(0, chatArea.scrollHeight);
        });

        await fetchFriendName();
      } catch (error) {
        setReadError(error.message);
        setLoadingChats(false);
      }
    };

    fetchData();
  }, [chatID, user.uid, navigate]);

  const handleChange = (event) => {
    setContent(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setWriteError(null);
    const chatArea = myRef.current;

    if (content) {
      try {
        if (!chatID.split("_").includes(user.uid)) {
          navigate("/chat");
          throw new Error("You shouldn't be here 🤨");
        }

        const chatRef = db.ref(`chats/${chatID}`);
        const newMessageRef = chatRef.push();

        await newMessageRef.set({
          content: content,
          timestamp: Date.now(),
          uid: user.uid,
          uname: user.displayName,
        });

        setContent("");
        document.querySelector(".chat-input").focus();
        chatArea.scrollBy(0, chatArea.scrollHeight);
      } catch (error) {
        setWriteError(error.message);
      }
    }
  };

  const fetchFriendName = async () => {
    const x = chatID.split("_");
    const friendID = x[0] === user.uid ? x[1] : x[0];

    try {
      const snapshot = await db.ref(`users/${friendID}`).once("value");
      setFriendName(snapshot.val().uname);
    } catch (error) {
      // Handle error if necessary
    }
  };

  const formatTime = (timestamp) => {
    const d = new Date(timestamp);
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const time = `${hours}:${minutes}`;
    return time;
  };

  return (
    <div>
      {/* Loading indicator */}
      {loadingChats ? <div className="spinner"></div> : ""}
      <section className="chat-container">
        <header className="chat-header">
          <Link to="/chat" className="px-2">
            <i className="fas fa-chevron-left"></i>
          </Link>
          <div className="chat-header-title">{friendName}</div>
          <div className="chat-settings">
            <Link to="/" className="px-2">
              <i className="fas fa-cog"></i>
            </Link>
          </div>
        </header>
        {readError ? (
          <div className="alert alert-danger py-0 rounded-0" role="alert">
            {readError}
          </div>
        ) : null}

        <main className="chatarea" ref={myRef}>
          {/* Chat area */}
          {chats.map((chat) => {
            return (
              <div
                key={chat.timestamp}
                className={
                  "msg " + (user.uid === chat.uid ? "right-msg" : "left-msg")
                }
              >
                <div
                  className="chat-bubble"
                  onDoubleClick={async () => {
                    if (chat.uid !== user.uid) return;
                    setDeletePrompt(true);
                    const x = await db
                      .ref(`chats/${chatID}`)
                      .orderByChild("timestamp")
                      .equalTo(chat.timestamp)
                      .once("value");
                    setDeletionMsgRef(`chats/${chatID}/${Object.keys(x.val())[0]}`);
                  }}
                >
                  <div className="msg-text">{chat.content}</div>
                  <div className="chat-info-time noselect text-right">
                    {formatTime(chat.timestamp)}
                  </div>
                </div>
              </div>
            );
          })}
        </main>
        {deletePrompt ? (
          <div
            className="d-flex justify-content-between align-items-center alert alert-danger mb-0 mt-1 rounded-0 py-1 px-2"
            role="alert"
          >
            <span>Do you wish to delete that message?</span>
            <div className="d-flex">
              <button
                type="button"
                className="btn btn-sm py-0 mr-1 btn-outline-danger"
                onClick={() => {
                  db.ref(deletionMsgRef).remove();
                  setDeletePrompt(false);
                }}
              >
                Yes
              </button>
              <button
                type="button"
                className="btn btn-sm py-0 btn-outline-success"
                onClick={() => setDeletePrompt(false)}
              >
                No
              </button>
            </div>
          </div>
        ) : null}
        <form onSubmit={handleSubmit} className="chat-inputarea">
          <input
            type="text"
            placeholder="Message..."
            className="chat-input"
            name="content"
            onChange={handleChange}
            value={content}
          ></input>
          <button type="submit" className="chat-sendbtn">
            Send
          </button>
        </form>
      </section>
    </div>
  );
}
