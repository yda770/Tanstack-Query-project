import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import Header from '../Header.jsx';
import { use } from 'react';
import { fetchEvent, deleteEvent } from '../../util/http.js';
import { useParams } from 'react-router-dom';
import { queryClient } from '../../util/http.js';
import { useState } from 'react';
import Modal from '../UI/Modal.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EventDetails() {

  const [isDeleting, setIsDeleting] = useState(false)

  const params = useParams();
  const navigate = useNavigate();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });

  const { mutate,
    isPending: isPendingDeletion,
    isError: isErrorDeletion,
    error: deleteError } = useMutation({
      mutationFn: deleteEvent,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['events'],
          refetchType: 'note'
        });
        navigate('/events')
      }
    })

  function handleStartDelete() {
    setIsDeleting(true);
  }
  function handleCancelDelete() {
    setIsDeleting(false);
  }
  function handleDelete() {
    mutate({ id: params.id });
  }

  let content;

  if (isPending) {
    content = <div id="event-details-content" className='center'>
      <p>Loading event data...</p>
    </div>
  }

  if (isError) {
    content = <div id="event-details-content" className='center'>
      <ErrorBlock title="Failed to load event" message={error.info?.message || 'Failed to fetch event data'} />
    </div>
  }

  if (data) {

    const date = new Date(data.date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>

        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>{date} @ {data.time}</time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleCancelDelete}>
          <h2>Are you sure?</h2>
          <p>Do you really want to delete?</p>
          <div className="form-actions">
            {isPendingDeletion && <p>Deleting......</p>}
            {!isPendingDeletion && (
              <>
                <button className="button-text" onClick={handleCancelDelete}>Cancel</button>
                <button className="button" onClick={handleDelete}>Delete</button>
              </>
            )}
          </div>
          {isErrorDeletion && <ErrorBlock title="Failed to delete event" message={deleteError.info?.message || 'Failed to delete event...'} />}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">{content}</article>
    </>
  );
}
