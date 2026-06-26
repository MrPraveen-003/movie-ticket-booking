import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { db } from '../../db';

export const getTheatres = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      const Theatre = mongoose.model('Theatre');
      const theatres = await Theatre.find().sort({ name: 1 });
      res.json(theatres);
    } else {
      const theatres = db.getTheatres();
      res.json(theatres);
    }
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to load theatres', error: err.message });
  }
};

export const createTheatre = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, location, screens } = req.body;
    if (!name || !location || !screens) {
      res.status(400).json({ message: 'Theatre name, location and screen declarations required' });
      return;
    }

    const screensArray = Array.isArray(screens) ? screens : screens.split(',').map((s: string) => s.trim());

    if (mongoose.connection.readyState === 1) {
      const Theatre = mongoose.model('Theatre');
      const newTheatre = await Theatre.create({
        name,
        location,
        screens: screensArray
      });
      res.status(201).json(newTheatre);
    } else {
      const newTheatre = db.createTheatre({
        name,
        location,
        screens: screensArray
      });
      res.status(201).json(newTheatre);
    }
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to add theater', error: err.message });
  }
};

export const updateTheatre = async (req: Request, res: Response): Promise<void> => {
  try {
    const theatre_id = req.params.id;
    if (mongoose.connection.readyState === 1) {
      const Theatre = mongoose.model('Theatre');
      const updatedTheatre = await Theatre.findByIdAndUpdate(theatre_id, req.body, { new: true });
      if (!updatedTheatre) {
        res.status(404).json({ message: 'Theatre not found' });
        return;
      }
      res.json(updatedTheatre);
    } else {
      const updatedTheatre = db.updateTheatre(theatre_id, req.body);
      res.json(updatedTheatre);
    }
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to update theater', error: err.message });
  }
};

export const deleteTheatre = async (req: Request, res: Response): Promise<void> => {
  try {
    const theatre_id = req.params.id;
    if (mongoose.connection.readyState === 1) {
      const Theatre = mongoose.model('Theatre');
      const Show = mongoose.model('Show');
      const theatre = await Theatre.findByIdAndDelete(theatre_id);
      if (!theatre) {
        res.status(404).json({ message: 'Theatre not found' });
        return;
      }
      await Show.deleteMany({ theatreId: theatre_id });
      res.json({ status: 'success', message: 'Theatre and its associated shows deleted successfully' });
    } else {
      db.deleteTheatre(theatre_id);
      res.json({ status: 'success', message: 'Theatre and its associated shows deleted successfully' });
    }
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to delete theater', error: err.message });
  }
};
