import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import CustomInput from '../../components/CustomInput';
import { toast } from 'react-hot-toast';
import Loader from '../../components/Loader';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { format } from 'date-fns';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import Toast from '../../components/Toast';

const ContactUs = () => {
  const messageRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [fetchingTickets, setFetchingTickets] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [ticketTypes, setTicketTypes] = useState([]);
  const [selectedTicketType, setSelectedTicketType] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Get user token and data from Redux store
  const { user } = useSelector(state => state.auth);
  
  // Set email from user data if available
  useEffect(() => {
    if(user?.email) {
      setEmail(user.email);
    }
  }, [user]);
  
  // Fetch ticket types and existing tickets
  useEffect(() => {
    if (user?.customerAuthUID) {
      fetchTicketTypes();
      fetchTickets();
    } 
  }, [user?.customerAuthUID]);
  
  const fetchTicketTypes = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND_BASE_URL}contactTicket/getContactTicketType`,
      
      );
      
      if (response.data && response.data.success) {
        setTicketTypes(response.data.data || []);
      } else {
        console.error('Failed to fetch ticket types:', response.data?.message);
      }
    } catch (error) {
      console.error('Error fetching ticket types:', error);
    }
  };
  
  const fetchTickets = async () => {
    setFetchingTickets(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND_BASE_URL}contactTicket/getTicket/${user?.customerAuthUID}`,
      
      );
      
      if (response.data && response.data.success) {
        setTickets(response.data.data || []);
      } else {
        console.error('Failed to fetch tickets:', response.data?.message);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setFetchingTickets(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const currentMessage = messageRef.current ? messageRef.current.value.trim() : '';
    
    if (!selectedTicketType || !currentMessage || !email.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        contactTicketTypeId: selectedTicketType,
        customerAuthUID: user?.customerAuthUID,
        email: email.trim(),
        message: currentMessage
      };
      
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BACKEND_BASE_URL}contactTicket/createTicket`,
        payload,
       
      );
      
      if (response.data && response.data.success) {
        Toast('Your message has been sent successfully');
        if (messageRef.current) {
          messageRef.current.value = '';
        }
        setSelectedTicketType('');
        setShowForm(false);
        // Refresh ticket list
        fetchTickets();
      } else {
        Toast(response.data?.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      Toast(error.response?.data?.message || 'An error occurred while sending your message');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy h:mm a');
    } catch (error) {
      return dateString;
    }
  };

  // Main history view
  const TicketHistoryView = () => (
    <>
      {fetchingTickets ? (
        <div className="flex justify-center py-8">
          <Loader size={30} color="#FF583A" />
        </div>
      ) : tickets.length > 0 ? (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div 
              key={ticket.contactTicketId} 
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <span 
                    className={`text-xs px-2 py-1 rounded-full ${
                      ticket.contactTicketTypeId?.title === 'Feedback' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-blue-100 text-blue-700'
                    } mr-2`}
                  >
                    {ticket.contactTicketTypeId?.title || 'Ticket'}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{formatDate(ticket.created_at)}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{ticket.message}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4">
            <div className="w-[110px] h-[110px] rounded-lg bg-white shadow-md flex items-center justify-center">
              <svg 
                width="45" 
                height="45" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#FF583A]"
              >
                <path 
                  d="M15.5 11.5H14.5V10.5C14.5 10.2 14.3 10 14 10H10C9.7 10 9.5 10.2 9.5 10.5V14.5C9.5 14.8 9.7 15 10 15H11V16H10C9.2 16 8.5 15.3 8.5 14.5V10.5C8.5 9.7 9.2 9 10 9H14C14.8 9 15.5 9.7 15.5 10.5V11.5Z" 
                  fill="currentColor"
                />
                <path 
                  d="M13.5 16H16.5C16.8 16 17 15.8 17 15.5V12.5C17 12.2 16.8 12 16.5 12H13.5C13.2 12 13 12.2 13 12.5V15.5C13 15.8 13.2 16 13.5 16ZM14 13H16V15H14V13Z" 
                  fill="currentColor"
                />
                <path 
                  d="M20.3 15.4L12 21.5L3.7 15.4C3.3 15.1 3 14.6 3 14.1V5.9C3 5.4 3.3 4.9 3.7 4.6L12 1.5L20.3 4.6C20.7 4.9 21 5.4 21 5.9V14.1C21 14.6 20.7 15.1 20.3 15.4ZM12 2.5L4.2 5.4C4.1 5.4 4 5.6 4 5.9V14.1C4 14.4 4.1 14.6 4.2 14.6L12 20.5L19.8 14.6C19.9 14.6 20 14.4 20 14.1V5.9C20 5.6 19.9 5.4 19.8 5.4L12 2.5Z" 
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>
          <p className="text-xl font-semibold mb-2">No history found</p>
          <p className="text-sm text-gray-500 text-center">You haven't sent any messages yet</p>
         
        </div>
      )}
    </>
  );

  // Contact Form View
  const ContactFormView = () => {
    return (
      <div className="h-full w-full">
        <div className="flex flex-col h-full">
          <div className="flex-1 p-1 overflow-y-auto">
            <h2 className="text-base font-medium mb-5 text-gray-800">How Can We Help You?</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <textarea
                  ref={messageRef}
                  placeholder="Type Here"
                  className="w-full p-3 bg-white rounded-lg border border-gray-200 focus:outline-none text-sm resize-none"
                  rows={7}
                  required
                />
              </div>
              
              <div className="relative">
                <div 
                  className="w-full p-3 bg-white rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer text-sm"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className={selectedTicketType ? "text-gray-800" : "text-gray-400"}>
                    {selectedTicketType ? 
                      ticketTypes.find(type => type.contactTicketTypeId === selectedTicketType)?.title : 
                      "Select Option"}
                  </span>
                  <ExpandMoreIcon className="text-gray-400" fontSize="small" />
                </div>
                
                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {ticketTypes.map((type) => (
                      <div 
                        key={type.contactTicketTypeId}
                        className="p-3 hover:bg-gray-50 cursor-pointer text-sm"
                        onClick={() => {
                          setSelectedTicketType(type.contactTicketTypeId);
                          setIsDropdownOpen(false);
                        }}
                      >
                        {type.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full p-3 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#5046E5] focus:border-[#5046E5] text-sm"
                  required
                />
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#FF583A] text-white py-3 rounded-[12px] cursor-pointer active:scale-95 transition duration-200 focus:outline-none text-sm font-medium"
                >
                  {loading ? <Loader /> : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 bg-white w-full shadow-sm">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => {
                if (showForm) {
                  setShowForm(false);
                } else {
                  window.history.back();
                }
              }}
              className="p-1 rounded-lg cursor-pointer active:scale-95 transition-transform duration-200"
            >
              <ArrowBackIosIcon className="text-lg" />
            </button>
            <h1 className="text-lg font-medium ml-2">Contact Us</h1>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-3 py-1.5 bg-[#FFF1EE] text-[#FF583A] text-sm font-medium rounded-lg hover:bg-[#fae1dc] active:scale-95 transition-colors cursor-pointer"
            >
              Reach Out
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 w-full flex-1">
        {showForm ? <ContactFormView /> : <TicketHistoryView />}
      </div>
    </div>
  );
};

export default ContactUs;