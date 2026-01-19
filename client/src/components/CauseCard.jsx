import React from 'react'

const CauseCard = ({ cause, isClickable = false, isSelected = false, onClick = null }) => {
	const handleClick = () => {
		if(isClickable && onClick){
			onClick(cause)
		}
	}

	// Generate a consistent color based on cause name hash
	const getColorScheme = (name) => {
		let hash = 0
		for (let i = 0; i < name.length; i++) {
			hash = ((hash << 5) - hash) + name.charCodeAt(i)
			hash = hash & hash
		}
		
		const colors = [
			{ bg: 'bg-gradient-to-br from-blue-500 to-blue-600', icon: '🎯' },
			{ bg: 'bg-gradient-to-br from-red-500 to-red-600', icon: '❤️' },
			{ bg: 'bg-gradient-to-br from-green-500 to-green-600', icon: '🌱' },
			{ bg: 'bg-gradient-to-br from-purple-500 to-purple-600', icon: '✨' },
			{ bg: 'bg-gradient-to-br from-orange-500 to-orange-600', icon: '🔥' },
			{ bg: 'bg-gradient-to-br from-pink-500 to-pink-600', icon: '💝' },
			{ bg: 'bg-gradient-to-br from-indigo-500 to-indigo-600', icon: '🚀' },
			{ bg: 'bg-gradient-to-br from-yellow-500 to-yellow-600', icon: '⭐' },
		]
		
		return colors[Math.abs(hash) % colors.length]
	}

	const colorScheme = getColorScheme(cause.name)

	return (
		<div onClick={handleClick}
			className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300
				${ isClickable ? 'cursor-pointer hover:shadow-2xl hover:scale-105' : '' }
				${ isSelected ? 'ring-4 ring-green-500 scale-105' : '' }
				${isClickable && !isSelected ? 'hover:-translate-y-1' : ''}
				bg-white`}
		>
			{/* Gradient Header with Icon */}
			<div className={`${colorScheme.bg} p-8 flex items-center justify-between relative overflow-hidden`}>
				{/* Background decoration */}
				<div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
				<div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
				
				{/* Icon and Title */}
				<div className="relative z-10 flex-1">
					<div className="text-5xl mb-3 opacity-80">{colorScheme.icon}</div>
					<h3 className="text-2xl font-bold text-white capitalize break-words">
						{cause.name.replace(/_/g, ' ')}
					</h3>
				</div>

				{/* Selection Indicator */}
				{isSelected && (
					<div className="absolute top-4 right-4 bg-green-400 rounded-full p-2">
						<svg
							className="w-6 h-6 text-white"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
						</svg>
					</div>
				)}
			</div>

			{/* Content Container */}
			<div className="p-6">
				{cause.description ? (
					<p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
						{cause.description}
					</p>
				) : (
					<p className="text-gray-500 text-sm italic">No description provided</p>
				)}
			</div>
		</div>
	)
}

export default CauseCard