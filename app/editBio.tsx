const handleEditBio = async (id: string) => {
    const newBio = prompt('Enter your new bio:');

    if (newBio) {
        try {
            const response = await fetch('/api/editBio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, newBio }),
            });

            if (!response.ok) {
                throw new Error('Response was not ok');
            }

            const data = await response.json();

            // Handle the response data here, e.g., updating the UI or state
            console.log('Bio updated successfully:', data);
        } catch (error) {
            console.error('Error:', error);
        }
    }
};
