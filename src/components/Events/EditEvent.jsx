import {
  Link,
  redirect,
  useNavigate,
  useParams,
  useSubmit,
} from "react-router-dom";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchEvent, queryClient, updateEvent } from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();
  //const submit=useSubmit();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ id: params.id, signal }),
  });
  let content;
  if (isPending) {
    content = <LoadingIndicator />;
  }
  if (isError) {
    content = (
      <div className="center">
        <ErrorBlock
          title={"Fetching the data failed"}
          message={error.info?.message}
        />
        <Link to="../" className="button-text">
          okay
        </Link>
      </div>
    );
  }
  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    );
  }
  const { mutate } = useMutation({
    mutationFn: updateEvent,
    onMutate: async (data) => {
      const NewEvent = data.event;
      await queryClient.cancelQueries({ queryKey: ["events"] });
      const prevEvent = queryClient.getQueryData({
        queryKey: ["events", params.id],
      });
      queryClient.setQueryData({ queryKey: ["events", NewEvent.id], NewEvent });
      return { prevEvent };
    },
    onError: (error, data, context) => {
      queryClient.setQueryData({ queryKey: ["events", params.id] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
  function handleSubmit(formData) {
    //submit(formData, {method: "PUT"});
    mutate({ event: { ...formData }, id: params.id });
    navigate("../");
  }

  function handleClose() {
    navigate("../");
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}

//We can use react router method too
// export function loader({params}){
//   return (
//     queryClient.fetchQuery({
//       queryKey: ["events",params.id],
//       queryFn: ({signal})=>fetchEvent({id: params.id,signal}),
//     })
//   )
// }
// export async function action({request, params}){
//     const formData = await request.formData();
//     const updatedEventData = Object.fromEntries(formData);
//     await updateEvent({event: updatedEventData, id: params.id});
//     queryClient.invalidateQueries({queryKey:["events",params.id]});
//     return redirect("../")

// }
