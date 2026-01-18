import React, { useContext, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import Navbar from '../components/Navbar'
import CauseCard from '../components/CauseCard'
import axios from 'axios'
import { toast } from 'react-toastify'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)

const PaymentForm = ({ amount, setAmount, userData, backendURL, selectedCause }) => {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const amountInputRef = React.useRef(null)
  const [processing, setProcessing] = useState(false)
  const [cardholderName, setCardholderName] = useState('')
  const [country, setCountry] = useState('')

  const quickAmounts = ['0.50', '1', '5', '10', '25', '50']
  const getSelectedQuickAmount = () => {
    if (quickAmounts.includes(amount)) {
      return amount
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!stripe || !elements) {
      toast.error('Stripe is not loaded')
      return
    }

    if (!amount || parseFloat(amount) < 0.50) {
      toast.error('Minimum donation amount is $0.50')
      return
    }

    if (!selectedCause) {
      toast.error('Please select a cause')
      return
    }

    if (!cardholderName.trim()) {
      toast.error('Please enter cardholder name')
      return
    }

    if (!country.trim()) {
      toast.error('Please select a country')
      return
    }

    setProcessing(true)

    try {
      // Step-1: Create payment intent on backend
      const paymentResponse = await axios.post(
        `${backendURL}/api/payment/create-payment-intent`,
        { amount: parseFloat(amount), userId: userData._id, causeId: selectedCause._id },
        { withCredentials: true }
      )

      if (!paymentResponse.data.success) {
        toast.error(paymentResponse.data.message || 'Failed to initiate payment')
        setProcessing(false)
        return
      }

      const { clientSecret, donationId } = paymentResponse.data
      const cardElement = elements.getElement(CardElement)

      // Step-2: Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardholderName,
            email: userData.email,
            address: {
              country: country,
            },
          },
        },
      })

      if (error) {
        await axios.post(
          `${backendURL}/api/payment/confirm-payment`,
          {
            paymentIntentId: null,
            donationId,
            status: 'failed',
            failureReason: error.message,
          },
          { withCredentials: true }
        )

        toast.error(`Payment failed: ${error.message}`)
        setTimeout(() => {
          navigate(`/payment-confirmation/${donationId}`)
        }, 1000)
        setProcessing(false)
        return
      }

      // Step-3: Confirm payment on backend
      if (paymentIntent) {
        const confirmResponse = await axios.post(
          `${backendURL}/api/payment/confirm-payment`,
          { paymentIntentId: paymentIntent.id, donationId },
          { withCredentials: true }
        )

        if (confirmResponse.data.success) {
          toast.success('Donation processed! Redirecting to confirmation...')
          setTimeout(() => {
            navigate(`/payment-confirmation/${donationId}`)
          }, 1000)
        } else {
          toast.error('Payment confirmation failed')
          setProcessing(false)
        }
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Error processing payment')
      setProcessing(false)
    }
  }

  // List of countries with their ISO 2-letter codes:
  const countries = [
    { name: 'United States', code: 'US' },
    { name: 'United Kingdom', code: 'GB' },
    { name: 'Canada', code: 'CA' },
    { name: 'Australia', code: 'AU' },
    { name: 'India', code: 'IN' },
    { name: 'Germany', code: 'DE' },
    { name: 'France', code: 'FR' },
    { name: 'Spain', code: 'ES' },
    { name: 'Italy', code: 'IT' },
    { name: 'Japan', code: 'JP' },
    { name: 'China', code: 'CN' },
    { name: 'Brazil', code: 'BR' },
    { name: 'Mexico', code: 'MX' },
    { name: 'South Korea', code: 'KR' },
    { name: 'Netherlands', code: 'NL' },
    { name: 'Switzerland', code: 'CH' },
    { name: 'Sweden', code: 'SE' },
    { name: 'Norway', code: 'NO' },
    { name: 'Denmark', code: 'DK' },
    { name: 'Ireland', code: 'IE' },
  ].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4 flex justify-center">
        <p className="text-gray-300 text-md font-medium tracking-wide">Pay by card</p>
      </div>

      {/* Amount Input */}
      <div className="space-y-3">
        <label className="block text-gray-700 text-sm font-medium">Donation Amount ($)</label>
        <input
          ref={amountInputRef}
          type="number"
          step="0.01"
          min="0.50"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700"
          disabled={processing}
          required
        />

        {/* Buttons */}
        <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
          {quickAmounts.map((quickAmount) => (
            <button
              key={quickAmount}
              type="button"
              onClick={() => setAmount(quickAmount)}
              className={`py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                getSelectedQuickAmount() === quickAmount
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              disabled={processing}
            >
              ${quickAmount} {quickAmount === '0.50' ? '(min)' : ''}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setAmount('')
              setTimeout(() => amountInputRef.current?.focus(), 0)
            }}
            className={`py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
              amount && !quickAmounts.includes(amount)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            disabled={processing}
          >
            Other
          </button>
        </div>
      </div>

      {/* Card Element from stripe */}
      <div className="space-y-2">
        <label className="block text-gray-700 text-sm font-medium">Card Number</label>
        <div className="border border-gray-300 rounded-lg p-4 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424242',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  '::placeholder': {
                    color: '#999',
                  },
                },
                invalid: {
                  color: '#fa755a',
                },
              },
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-gray-700 text-sm font-medium">Cardholder Name</label>
        <input
          type="text"
          placeholder="Full Name"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700"
          disabled={processing}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-gray-700 text-sm font-medium">Country</label>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700 bg-white"
          disabled={processing}
          required
        >
          <option value="">Select a country</option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name} ({c.code})
            </option>
          ))}
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={processing || !stripe}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors mt-8"
      >
        {processing ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          `Pay $${parseFloat(amount || '0').toFixed(2)}`
        )}
      </button>
    </form>
  )
}

const DonationPayment = () => {
  const { userData, backendURL, causes, causesLoading } = useContext(AppContext)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const causeId = searchParams.get('causeId')
  const initialAmount = searchParams.get('amount') || '0.50'
  const [amount, setAmount] = useState(initialAmount)
  
  // Find the selected cause from the causes array
  const selectedCause = causes.find(cause => cause._id === causeId)

  if (!userData || userData.role !== 'donor') {
    return <div>Access Denied</div>
  }

  if (causesLoading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Loading...</p>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!causeId || !selectedCause) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Please select a cause first</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleCopy = (event) => {
    const textToCopy = event.currentTarget.innerText;

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        toast.success('Card number copied to clipboard');
      })
      .catch((err) => {
        toast.error('Failed to copy text: ', err);
      });
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-8 pb-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Side */}
            <div className="lg:col-span-1 flex flex-col gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Donation Cause</h3>
                <div className="max-w-sm">
                  <CauseCard
                    cause={selectedCause}
                    isClickable={false}
                    isSelected={false}
                  />
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <div className="mb-4">
                  <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Donation Amount</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">${parseFloat(amount || '0').toFixed(2)}</span>
                </div>
                <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-lg">
                  <p className="text-gray-700 text-sm">
                    <span className="font-semibold">Your donation will help us make a difference.</span> Every contribution matters and goes directly towards our mission to support those in need.
                  </p>
                </div>
                <div className="mt-6 px-4 py-2 bg-white border border-green-100 rounded-lg">
                  <p className="text-gray-900 text-lg mb-2">Test Card Numbers: <span className='text-sm text-gray-400 ml-4'>(Click to Copy)</span></p>
                  <p className="text-gray-800 text-sm mb-1">Successfull Payment: <span className='ml-2 cursor-pointer' onClick={handleCopy}>4242 4242 4242 4242</span></p>
                  <p className="text-gray-800 text-sm mb-1">Insufficient Funds: <span className='ml-2 cursor-pointer' onClick={handleCopy}>4000 0000 0000 9995</span></p>
                  <p className="text-gray-800 text-sm mb-1">For more test card details: <a href="https://docs.stripe.com/testing" target="blank" className="text-blue-400 hover:text-blue-600 hover:underline hover:underline-offset-2">click here</a></p>
                </div>
              </div>
            </div>

            {/* Right Side */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8">
              <Elements stripe={stripePromise}>
                <PaymentForm 
                  amount={amount} 
                  setAmount={setAmount} 
                  userData={userData} 
                  backendURL={backendURL}
                  selectedCause={selectedCause}
                />
              </Elements>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DonationPayment