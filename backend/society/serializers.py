from rest_framework import serializers
from .models import Member, Area, House, Collection, SubCollection, MemberObligation, Todo, AppSettings


class AreaSerializer(serializers.ModelSerializer):
    total_houses = serializers.SerializerMethodField()
    total_live_members = serializers.SerializerMethodField()
    
    class Meta:
        model = Area
        fields = '__all__'
        fields = ['id', 'name', 'description', 'created_at', 'updated_at', 'total_houses', 'total_live_members']
    
    def get_total_houses(self, obj):
        return obj.houses.count()
    
    def get_total_live_members(self, obj):
        # Count only live members in this area
        return Member.objects.filter(house__area=obj, status='live').count()


class HouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = House
        fields = '__all__'


class MemberSerializer(serializers.ModelSerializer):
    photo = serializers.ImageField(required=False)

    class Meta:
        model = Member
        fields = '__all__'
        read_only_fields = ('member_id',)


class CollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Collection
        fields = '__all__'


class SubCollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCollection
        fields = '__all__'


class MemberObligationSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemberObligation
        fields = '__all__'


class TodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = '__all__'


class AppSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppSettings
        fields = '__all__'