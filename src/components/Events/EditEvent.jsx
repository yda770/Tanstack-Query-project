import { Link, redirect, useNavigate, useParams, useSubmit, useNavigation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { fetchEvent, updateEvent, queryClient } from '../../util/http.js';
// import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
// import { useMutation } from '@tanstack/react-query';

export default function EditEvent() {
  const navigate = useNavigate();
  const { state } = useNavigation();
  const submit = useSubmit();
  const params = useParams();

  const { data, isError, error } = useQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
    staleTime: 10000
  });

  // const { mutate } = useMutation({
  //   mutationFn: updateEvent,
  //   onMutate: async (data) => {
  //     const newEvent = data.event;
  //     await queryClient.cancelQueries({ queryKey: ['events', params.id] });
  //     const prevEvent = queryClient.getQueriesData(['events', params.id]);
  //     queryClient.setQueriesData(['events', params.id], newEvent);

  //     return { prevEvent };

  //   },
  //   onError: (error, data, context) => {
  //     queryClient.setQueriesData(['events', params.id], context.prevEvent);
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries({ queryKey: ['events', params.id] });
  //   }
  // })

  function handleSubmit(formData) {
    // mutate({ id: params.id, event: formData });
    // navigate('../');
    submit(formData, { method: 'PUT' }); // Call action function by router
  }

  function handleClose() {
    navigate('../');
  }

  let content;

  // if (isPending) { // Do this from react router
  //   content = <div id="event-details-content" className='center'>
  //     <LoadingIndicator />
  //   </div>
  // }

  if (isError) {
    content = <>
      <ErrorBlock title="Failed to load event" message={error.info?.message || 'Failed to fetch event data'} />

      <div className='form-actions'>
        <Link to="../" className="button">
          Okay
        </Link>
      </div>
    </>
  }

  if (data) {
    content = <EventForm inputData={data} onSubmit={handleSubmit}>
      {state === 'submitting' ? (<p>Submitting...</p>) : (
        <>
          <Link to="../" className="button-text">
            Cancel
          </Link>
          <button type="submit" className="button">
            Update
          </button>
        </>
      )}
    </EventForm>

  }



  return (
    <Modal onClose={handleClose}>
      {content}
    </Modal>
  );
}

export function loader({ params }) {
  return queryClient.fetchQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const updatedEventData = Object.fromEntries(formData);
  await updateEvent({ id: params.id, event: updatedEventData });
  await queryClient.invalidateQueries(['events']);
  return redirect('../');
}
