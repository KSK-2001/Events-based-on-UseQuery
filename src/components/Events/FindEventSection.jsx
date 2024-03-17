import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { fetchEvents } from "../../util/http";
import LoadingIndicator from "../UI/LoadingIndicator";
import ErrorBlock from "../UI/ErrorBlock";
import EventItem from "./EventItem";

export default function FindEventSection() {
  const searchElement = useRef();
  const [searchTerm, SetSearchTerm] = useState(undefined);

  function handleSubmit(event) {
    event.preventDefault();
    SetSearchTerm(searchElement.current?.value);
  }

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["search", searchTerm],
    queryFn: ({ signal }) =>
      fetchEvents({ signal, searchTerm: searchElement.current?.value }),
    enabled: searchTerm !== undefined,
  });

  let content = <p>Please enter a search term and to find events.</p>;
  if (isLoading) {
    content = <LoadingIndicator />;
  }
  if (isError) {
    content = (
      <ErrorBlock
        title={"Fetching the data failed"}
        message={error.info?.message}
      />
    );
  }

  if (data) {
    content = (
      <ul className="events-list">
        {data.map((item) => (
          <li key={item.id}>
            <EventItem event={item} />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <section className="content-section" id="all-events-section">
      <header>
        <h2>Find your next event!</h2>
        <form onSubmit={handleSubmit} id="search-form">
          <input
            type="search"
            placeholder="Search events"
            ref={searchElement}
          />
          <button>Search</button>
        </form>
      </header>
      {content}
    </section>
  );
}
