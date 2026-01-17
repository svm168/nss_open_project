import React from 'react'

const CauseCard = ({ cause, isClickable = false, isSelected = false, onClick = null }) => {
	const handleClick = () => {
		if (isClickable && onClick) {
			onClick(cause)
		}
	}

	// Handle both uploaded images and image URLs
	const getImageUrl = () => {
		if (!cause.image) {
			return null
		}
		// If it starts with http/https, it's a URL
		if (cause.image.startsWith('http')) {
			return cause.image
		}
		// Otherwise, it's a filename from uploads
		return `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/uploads/${cause.image}`
	}

	const imageUrl = getImageUrl()

	return (
		<div
			onClick={handleClick}
			className={`rounded-lg overflow-hidden shadow-lg transition-all ${
				isClickable
					? 'cursor-pointer hover:shadow-xl hover:scale-105'
					: ''
			} ${
				isSelected
					? 'ring-4 ring-green-500 scale-105'
					: ''
			} ${
				isClickable && !isSelected
					? 'bg-white'
					: isSelected
					? 'bg-green-50'
					: 'bg-white'
			}`}
		>
			{/* Image Container */}
			<div className="relative w-full h-48 overflow-hidden bg-gray-200">
				{imageUrl ? (
					<img
						src={imageUrl}
						alt={cause.name}
						className="w-full h-full object-cover"
						onError={(e) => {
							e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="20" fill="%23999" text-anchor="middle" dy=".3em"%3EImage Not Found%3C/text%3E%3C/svg%3E'
						}}
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center">
						<svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
							<path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
						</svg>
					</div>
				)}
				{isSelected && (
					<div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
						<div className="bg-green-500 rounded-full p-3">
							<svg
								className="w-8 h-8 text-white"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
							</svg>
						</div>
					</div>
				)}
			</div>

			{/* Content Container */}
			<div className="p-4">
				<h3 className="text-lg font-bold text-gray-800 mb-2 capitalize">
					{cause.name.replace(/_/g, ' ')}
				</h3>
				{cause.description && (
					<p className="text-sm text-gray-600">
						{cause.description}
					</p>
				)}
			</div>
		</div>
	)
}

export default CauseCard
