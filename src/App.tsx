import { BrowserRouter } from 'react-router';

import { WeddingAudioProvider } from './audio/WeddingAudioProvider';
import { AppRoutes } from './routes/AppRoutes';

function App() {
	return (
		<WeddingAudioProvider>
			<BrowserRouter>
				<AppRoutes />
			</BrowserRouter>
		</WeddingAudioProvider>
	);
}

export default App;
