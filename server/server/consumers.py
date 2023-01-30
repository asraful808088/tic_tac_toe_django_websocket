import json

from channels.db import database_sync_to_async
from channels.exceptions import StopConsumer
from channels.generic.websocket import AsyncWebsocketConsumer
from game.models import GameGroup


class ChatWebSocket(AsyncWebsocketConsumer):
    async def connect(self):
        self.params = self.scope['url_route']['kwargs']['params']
        await self.channel_layer.group_add(self.params,self.channel_name)
        await self.set_group(self.params,self.channel_name)
        count = await self.group_count(self.params)
        if count > 2:
            print("clear your db or hit another exp: http://localhost:8000/join/<another name>")
            self.close()
        else:
            await self.accept()
            
    @database_sync_to_async
    def set_group(self,group_name,id):
      GameGroup(
        group_name=group_name,
        user_name=id,
        ).save()

    @database_sync_to_async
    def delete_group(self,group_name,id):
      GameGroup.objects.filter(
        group_name=group_name,
        user_name=id,
        ).delete()

    @database_sync_to_async
    def group_count(self,group_name):
       data=[]
       data = GameGroup.objects.filter(
        group_name=group_name,
        )
       return len(data)
    async def receive(self, text_data=None, bytes_data=None):
     count = await self.group_count(self.params)
     jsonType = json.loads(text_data)
     if jsonType['type'] == 'init':
         if count == 2:
            await self.send(text_data=json.dumps({
                'type':"join_both",
                'user_id':self.channel_name,
            }))
         else:
          await self.send(text_data=json.dumps({
                'type':"init",
                'user_id':self.channel_name,
            }))
     elif jsonType['type'] == 'join_both':
        await self.channel_layer.group_send(self.params,{
            'type':"chat.message",
            'user_id':self.channel_name,
            'otherName':jsonType['name'],
            'group_type':'join_both'
        })
     elif jsonType['type'] == 'init_send_info':
        await self.channel_layer.group_send(self.params,{
            'type':"chat.message",
            'user_id':self.channel_name,
            'otherName':jsonType['name'],
            'group_type':'init_send_info'
        })
     elif jsonType['type'] == 'start_game':
        await self.channel_layer.group_send(self.params,{
            'type':"chat.message",
            'group_type':'start_game'
        })
     elif jsonType['type'] == 'clickBox':
        await self.channel_layer.group_send(self.params,{
            'type':"chat.message",
            'group_type':'clickBox',
            'index':jsonType['index'],
            'user_id':jsonType['user_id']
        })
     elif jsonType['type'] == 'spatial_alert':
        await self.channel_layer.group_send(self.params,{
            'type':"chat.message",
            'group_type':'spatial_alert',
            'name':jsonType['name'],
        })


        

    async def chat_message(self,event):
         if event['group_type'] == "join_both":
            await self.send(text_data=json.dumps({
            'type':'init_send_info',
            "otherName":event['otherName'],
            'user_id':event['user_id']
            }))
         elif event['group_type'] == "init_send_info":
           await self.send(text_data=json.dumps({
           'type':'opponent_send_info',
           "otherName":event['otherName'],
           'user_id':event['user_id']
           }))
         elif event['group_type'] == "start_game":
            await self.send(text_data=json.dumps({
           'type':'start_game',
           }))
         elif event['group_type'] == "clickBox":
            await self.send(text_data=json.dumps({
           'type':'clickBox',
           'index':event['index'],
           'user_id':event['user_id']
           }))
         elif event['group_type'] == "spatial_alert":
            await self.send(text_data=json.dumps({
           'type':'spatial_alert',
           'name':event['name']
           }))
         elif event['group_type'] == "disconnect":
            await self.send(text_data=json.dumps({
           'type':'disconnect',
           }))
        



       

    async def disconnect(self,event):
        await self.channel_layer.group_send(self.params,{
            'type':"chat.message",
            'group_type':'disconnect',
        })
        await self.channel_layer.group_discard(self.params,self.channel_name)
        await self.delete_group('a',self.channel_name)
        raise StopConsumer()