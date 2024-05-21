import { NextApiRequest, NextApiResponse } from 'next';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { id, newBio } = req.body;

    if (!id || !newBio) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const supabase = createServerComponentClient({ cookies });
        const { data, error } = await supabase
            .from('profiles')
            .update({ bio: newBio })
            .eq('id', id);

        if (error) {
            throw error;
        }

        res.status(200).json({ message: 'Bio updated successfully', data });
    } catch (error) {
        console.error('Error updating bio:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export default handler;
