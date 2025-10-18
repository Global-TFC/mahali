from rest_framework import serializers
from .models import Member, Area, House, Collection, SubCollection, MemberObligation, Todo, AppSettings
from typing import Any


class AreaSerializer(serializers.ModelSerializer):
    total_houses = serializers.SerializerMethodField()
    total_live_members = serializers.SerializerMethodField()
    
    class Meta:
        model = Area
        fields = ['id', 'name', 'description', 'created_at', 'updated_at', 'total_houses', 'total_live_members']
    
    def get_total_houses(self, obj: Any) -> int:
        return obj.houses.count()
    
    def get_total_live_members(self, obj: Any) -> int:
        # Count only live members in this area
        return Member.objects.filter(house__area=obj, status='live').count()


class HouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = House
        fields = '__all__'
        read_only_fields = ('home_id',)


class HouseListSerializer(serializers.ModelSerializer):
    """Serializer for house listing that includes area name and member count"""
    area_name = serializers.CharField(source='area.name', read_only=True)
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = House
        fields = ['home_id', 'house_name', 'family_name', 'location_name', 'area_name', 'member_count']
    
    def get_member_count(self, obj):
        # Use the related manager to count members
        return obj.members.count()


class HouseDetailSerializer(serializers.ModelSerializer):
    area_name = serializers.CharField(source='area.name', read_only=True)
    
    class Meta:
        model = House
        fields = ['home_id', 'house_name', 'family_name', 'location_name', 'area_name']


class MemberSerializer(serializers.ModelSerializer):
    photo = serializers.ImageField(required=False)
    house = serializers.SlugRelatedField(
        queryset=House.objects.all(),
        slug_field='home_id',
        required=False
    )
    father = serializers.SlugRelatedField(
        queryset=Member.objects.all(),
        slug_field='member_id',
        required=False
    )
    mother = serializers.SlugRelatedField(
        queryset=Member.objects.all(),
        slug_field='member_id',
        required=False
    )

    class Meta:
        model = Member
        fields = '__all__'
        read_only_fields = ('member_id',)


class MemberDetailSerializer(serializers.ModelSerializer):
    """Serializer that includes full house details for member listing"""
    house = HouseDetailSerializer(read_only=True)
    
    class Meta:
        model = Member
        fields = '__all__'


class CollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Collection
        fields = '__all__'


class SubCollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCollection
        fields = '__all__'


class MemberObligationSerializer(serializers.ModelSerializer):
    # Handle member ID properly - accept both string and integer
    member = serializers.SlugRelatedField(
        queryset=Member.objects.all(),
        slug_field='member_id'
    )
    # Handle subcollection ID properly
    subcollection = serializers.PrimaryKeyRelatedField(
        queryset=SubCollection.objects.all()
    )
    
    class Meta:
        model = MemberObligation
        fields = '__all__'


class MemberObligationDetailSerializer(serializers.ModelSerializer):
    """Serializer that includes full member details for listing"""
    
    class Meta:
        model = MemberObligation
        fields = '__all__'
        depth = 1


class TodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = '__all__'


class AppSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppSettings
        fields = '__all__'