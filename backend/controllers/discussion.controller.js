import Discussion from '../models/discussion.model.js';


export const getDiscussionsByArticle = async (req, res) => {
  try {
    const { articleId } = req.params;
    const discussions = await Discussion.find({ articleId }).populate('userId', 'name');
    res.json(discussions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const createDiscussion = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { content, parentId } = req.body;
    const userId = req.user._id;

    const discussion = new Discussion({
      articleId,
      userId,
      content,
      parentId: parentId || null,
    });

    await discussion.save();
    res.status(201).json(discussion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

