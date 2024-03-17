import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent, queryClient } from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import { useState } from "react";
import Modal from "../UI/Modal.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EventDetails() {
  const [isdeleting, SetisDeleting] = useState(false);
  const params = useParams();
  const navigate = useNavigate();
  const { data, isError, isPending, error } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });

  const {
    mutate,
    isPending: isPendingDeletion,
    isError: isErrorDeletion,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      navigate("/events");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
  function handleDeleteStop() {
    SetisDeleting(false);
  }
  function handleDeleteStart() {
    SetisDeleting(true);
  }
  function handleDelete() {
    mutate({ id: params.id });
  }
  let content;
  if (isPending) {
    content = <LoadingIndicator />;
  }
  if (isError) {
    content = (
      <div id="event-details-content" className="center">
        <ErrorBlock
          title={"Fetching the data failed"}
          message={error.info?.message}
        />
      </div>
    );
  }
  if (data) {
    content = (
      <article id="event-details">
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleDeleteStart}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt="images" />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {data.date}@{data.time}
              </time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </article>
    );
  }
  return (
    <>
      {isdeleting && (
        <Modal onClose={handleDeleteStop}>
          <div>
            <h1>Are you sure you want to delete this event?</h1>
            {isPendingDeletion && <LoadingIndicator />}
            {!isPendingDeletion && (
              <div className="form-actions">
                <button className="button-text" onClick={handleDeleteStop}>
                  Cancel
                </button>
                <button className="button" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            )}
            {isErrorDeletion && (
              <ErrorBlock
                title={"Failed to delete the event"}
                message={deleteError.info?.message}
              />
            )}
          </div>
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {content}
    </>
  );
}
