import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/:topic', async (req, res) => {
  const topic = req.params.topic;
  try {
    const url = `https://api.gdeltproject.org/api/v2/trends/timelinejson?datanorm=raw&query=${encodeURIComponent(topic)}`;
    const { data } = await axios.get(url);

    const timeline = data.timeline?.[0]?.data || [];
    if (!timeline.length) {
        return res.status(404).json({ error: "No insights found for this topic." });}
    const volumeData = timeline.map(item => ({
      date: item.date,
      count: item.value,
      avgTone: item.avgTone
    }));

    res.json({ volumeData });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch insights' });
    console.error("Error in /api/insights/:topic:", err); 
  }
});

export default router;
