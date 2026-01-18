import { useEffect, useState, useContext } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { AppContext } from '../context/AppContext'

export default function AdminApproval() {
	const [searchParams] = useSearchParams()
	const navigate = useNavigate()
	const { backendURL } = useContext(AppContext)
	const [status, setStatus] = useState('processing')
	const [message, setMessage] = useState('Processing your request...')

	useEffect(() => {
		axios.defaults.withCredentials = true
		
		const token = searchParams.get('token')
		
		if (!token) {
			setStatus('error')
			setMessage('No approval token found. Please check the email link.')
			return
		}

		// Decode JWT to determine action (approve or deny)
		try {
			const parts = token.split('.')
			const decoded = JSON.parse(atob(parts[1]))
			
			const action = decoded.action
			
			if (action !== 'approve' && action !== 'deny') {
				throw new Error('Invalid token action')
			}

			const endpoint = action === 'approve' ? '/api/auth/approve-admin' : '/api/auth/deny-admin'
			
			axios.post(`${backendURL}${endpoint}`, { token })
			.then(res => res.data)
			.then(data => {
				if (data.success) {
					setStatus('success')
					const successMessage = action === 'approve'
						? 'Admin access has been approved successfully!'
						: 'Admin access request has been denied.'
					setMessage(successMessage)
				} else {
					setStatus('error')
					setMessage(data.message || 'An error occurred while processing your request.')
				}
			})
			.catch(error => {
				setStatus('error')
				setMessage('An error occurred. Please try again later.')
				console.error('Error:', error)
			})
		} catch (error) {
			setStatus('error')
			setMessage('Invalid token. Please check the email link.')
			console.error('Token decode error:', error)
		}
	}, [searchParams, navigate, backendURL])

	return (
		<div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-700 p-5">
			<style>{`
				@keyframes slideIn {
					from {
						opacity: 0;
						transform: translateY(20px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
				@keyframes spin {
					0% { transform: rotate(0deg); }
					100% { transform: rotate(360deg); }
				}
				@keyframes popIn {
					0% { transform: scale(0); }
					50% { transform: scale(1.1); }
					100% { transform: scale(1); }
				}
				.animate-slideIn {
					animation: slideIn 0.5s ease-out;
				}
				.animate-spin-custom {
					animation: spin 1s linear infinite;
				}
				.animate-popIn {
					animation: popIn 0.5s ease-out;
				}
			`}</style>

			<div className="bg-white rounded-xl p-12 md:p-16 shadow-2xl max-w-md w-full text-center animate-slideIn">
				<div className="mb-8">
					{status === 'processing' && (
						<>
							<div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-500 rounded-full mx-auto mb-6 animate-spin-custom"></div>
							<h2 className="text-2xl font-semibold text-gray-800">Processing Request</h2>
						</>
					)}
					{status === 'success' && (
						<>
							<div className="text-5xl font-bold text-green-500 mb-6 animate-popIn">✓</div>
							<h2 className="text-2xl font-semibold text-gray-800">Request Processed Successfully</h2>
						</>
					)}
					{status === 'error' && (
						<>
							<div className="text-5xl font-bold text-red-500 mb-6 animate-popIn">✕</div>
							<h2 className="text-2xl font-semibold text-gray-800">Request Failed</h2>
						</>
					)}
				</div>
				
				<p className={`text-base leading-relaxed my-6 ${
					status === 'success' ? 'text-green-500 font-medium' : 
					status === 'error' ? 'text-red-500 font-medium' : 
					'text-gray-600'
				}`}>
					{message}
				</p>

				{status !== 'processing' && (
					<p className="text-sm text-gray-500 mt-6 italic">
						{status === 'success' 
							? 'You can close this tab.' 
							: 'Please check your email or contact the administrator.'}
					</p>
				)}
			</div>
		</div>
	)
}
