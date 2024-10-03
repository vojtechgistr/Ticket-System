import './index.css'

const LoadingCircle = ({scale = 1}: {scale?: number}) => {
    return (
        <div className="loading-container">
            <div className="loader" style={
                {
                    width: 12 * scale,
                    height: 12 * scale
                }
            }></div>
        </div>
    )
}

export default LoadingCircle;